import os
import random
import sqlite3
import time
from flask import Flask, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "usuarios.db")

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "gym-dev-secret-key")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def normalizar_altura_a_cm(valor):
    """Acepta altura en metros (p. ej. 1.70) o en cm (p. ej. 170). Devuelve cm o None."""
    try:
        x = float(valor)
    except (TypeError, ValueError):
        return None
    if x <= 0:
        return None
    if x < 3.0:
        return round(x * 100.0, 2)
    return round(x, 2)


def init_db():
    conn = get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            correo TEXT NOT NULL UNIQUE,
            telefono TEXT,
            correo_respaldo TEXT,
            contrasena_hash TEXT NOT NULL,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    existing_columns = {
        row["name"] for row in conn.execute("PRAGMA table_info(usuarios)").fetchall()
    }
    if "telefono" not in existing_columns:
        conn.execute("ALTER TABLE usuarios ADD COLUMN telefono TEXT")
    if "correo_respaldo" not in existing_columns:
        conn.execute("ALTER TABLE usuarios ADD COLUMN correo_respaldo TEXT")
    if "premium" not in existing_columns:
        conn.execute("ALTER TABLE usuarios ADD COLUMN premium INTEGER NOT NULL DEFAULT 0")

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS imc_registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            edad INTEGER NOT NULL,
            sexo TEXT NOT NULL,
            peso_kg REAL NOT NULL,
            altura_cm REAL NOT NULL,
            imc REAL NOT NULL,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES usuarios(id)
        )
        """
    )

    conn.execute(
        """
        UPDATE usuarios SET premium = 1
        WHERE LOWER(correo) IN ('erickgo2534@gmail.com', 'erickgp2534@gmail.com')
        """
    )

    conn.commit()
    conn.close()


@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/api/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    nombre = (payload.get("nombre") or "").strip()
    correo = (payload.get("correo") or "").strip().lower()
    telefono = (payload.get("telefono") or "").strip()
    correo_respaldo = (payload.get("correo_respaldo") or "").strip().lower()
    contrasena = payload.get("contrasena") or ""

    if not nombre or not correo or not contrasena:
        return jsonify({"error": "Nombre, correo y contraseña son obligatorios."}), 400

    if len(contrasena) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres."}), 400

    contrasena_hash = generate_password_hash(contrasena)

    try:
        conn = get_conn()
        cursor = conn.execute(
            """
            INSERT INTO usuarios (nombre, correo, telefono, correo_respaldo, contrasena_hash)
            VALUES (?, ?, ?, ?, ?)
            """,
            (nombre, correo, telefono, correo_respaldo, contrasena_hash),
        )
        conn.commit()
        user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"error": "Ese correo ya está registrado."}), 409
    finally:
        conn.close()

    return jsonify(
        {
            "message": "Usuario registrado correctamente.",
            "usuario": {
                "id": user_id,
                "nombre": nombre,
                "correo": correo,
                "telefono": telefono,
                "correo_respaldo": correo_respaldo,
                "premium": False,
            },
        }
    ), 201


@app.route("/api/users", methods=["GET"])
def list_users():
    if "user_id" not in session:
        return jsonify({"error": "No autorizado."}), 401

    conn = get_conn()
    rows = conn.execute(
        """
        SELECT id, nombre, correo, telefono, correo_respaldo, premium, creado_en
        FROM usuarios
        ORDER BY id DESC
        """
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


@app.route("/api/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    correo = (payload.get("correo") or "").strip().lower()
    contrasena = payload.get("contrasena") or ""

    if not correo or not contrasena:
        return jsonify({"error": "Correo y contraseña son obligatorios."}), 400

    conn = get_conn()
    user = conn.execute(
        """
        SELECT id, nombre, correo, telefono, correo_respaldo, contrasena_hash, premium
        FROM usuarios
        WHERE correo = ?
        """,
        (correo,),
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user["contrasena_hash"], contrasena):
        return jsonify({"error": "Credenciales incorrectas."}), 401

    es_premium = bool(user["premium"])
    session["user_id"] = user["id"]
    session["user_name"] = user["nombre"]
    session["user_email"] = user["correo"]
    session["premium"] = es_premium
    session.pop("recovery_pending", None)

    return jsonify(
        {
            "message": "Inicio de sesión correcto.",
            "usuario": {
                "id": user["id"],
                "nombre": user["nombre"],
                "correo": user["correo"],
                "premium": es_premium,
            },
        }
    )


@app.route("/api/recovery-start", methods=["POST"])
def recovery_start():
    payload = request.get_json(silent=True) or {}
    correo = (payload.get("correo") or "").strip().lower()
    metodo = (payload.get("metodo") or "").strip()

    if not correo or metodo not in {"telefono", "correo_respaldo"}:
        return jsonify({"error": "Correo y método son obligatorios."}), 400

    conn = get_conn()
    user = conn.execute(
        "SELECT id, nombre, correo, telefono, correo_respaldo FROM usuarios WHERE correo = ?",
        (correo,),
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "No existe una cuenta con ese correo."}), 404

    destino = user[metodo]
    if not destino:
        readable = "teléfono" if metodo == "telefono" else "correo de respaldo"
        return jsonify({"error": f"Tu cuenta no tiene {readable} configurado."}), 400

    codigo = f"{random.randint(0, 999999):06d}"
    session["recovery_pending"] = {
        "user_id": user["id"],
        "user_email": user["correo"],
        "code_hash": generate_password_hash(codigo),
        "expires_at": int(time.time()) + 300,
    }

    return jsonify(
        {
            "message": "Código de recuperación enviado.",
            "destino": destino,
            "demo_code": codigo,
        }
    )


@app.route("/api/recovery-reset", methods=["POST"])
def recovery_reset():
    payload = request.get_json(silent=True) or {}
    codigo = (payload.get("codigo") or "").strip()
    nueva_contrasena = payload.get("nueva_contrasena") or ""

    pending = session.get("recovery_pending")
    if not pending:
        return jsonify({"error": "No hay recuperación pendiente."}), 400

    if not codigo or not check_password_hash(pending["code_hash"], codigo):
        return jsonify({"error": "Código incorrecto."}), 401

    if int(time.time()) > int(pending.get("expires_at", 0)):
        session.pop("recovery_pending", None)
        return jsonify({"error": "El código expiró. Solicita uno nuevo."}), 400

    if len(nueva_contrasena) < 6:
        return jsonify({"error": "La nueva contraseña debe tener al menos 6 caracteres."}), 400

    conn = get_conn()
    conn.execute(
        "UPDATE usuarios SET contrasena_hash = ? WHERE id = ?",
        (generate_password_hash(nueva_contrasena), pending["user_id"]),
    )
    conn.commit()
    conn.close()
    session.pop("recovery_pending", None)

    return jsonify({"message": "Contraseña actualizada correctamente."})


@app.route("/api/me", methods=["GET"])
def me():
    if "user_id" not in session:
        return jsonify({"authenticated": False}), 401

    return jsonify(
        {
            "authenticated": True,
            "usuario": {
                "id": session.get("user_id"),
                "nombre": session.get("user_name"),
                "correo": session.get("user_email"),
                "premium": bool(session.get("premium")),
            },
        }
    )


@app.route("/api/imc/latest", methods=["GET"])
def imc_latest():
    if "user_id" not in session:
        return jsonify({"error": "No autorizado."}), 401

    conn = get_conn()
    row = conn.execute(
        """
        SELECT nombre, edad, sexo, peso_kg, altura_cm, imc, creado_en
        FROM imc_registros
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (session["user_id"],),
    ).fetchone()
    conn.close()

    if not row:
        return jsonify({"registro": None})

    return jsonify({"registro": dict(row)})


@app.route("/api/imc", methods=["POST"])
def imc_guardar():
    if "user_id" not in session:
        return jsonify({"error": "Debes iniciar sesión."}), 401

    payload = request.get_json(silent=True) or {}
    nombre = (payload.get("nombre") or "").strip()
    edad = payload.get("edad")
    sexo = (payload.get("sexo") or "").strip().lower()
    peso_kg = payload.get("peso_kg")
    altura_cm = payload.get("altura_cm")

    sexos_ok = {"masculino", "femenino", "otro"}
    if not nombre or sexo not in sexos_ok:
        return jsonify({"error": "Nombre y sexo válidos son obligatorios."}), 400

    try:
        edad = int(edad)
        peso_kg = float(peso_kg)
    except (TypeError, ValueError):
        return jsonify({"error": "Edad y peso deben ser números válidos."}), 400

    altura_cm = normalizar_altura_a_cm(altura_cm)
    if altura_cm is None:
        return jsonify(
            {"error": "Altura inválida. Usa metros (ej. 1.70) o centímetros (ej. 170)."}
        ), 400

    if edad < 10 or edad > 120 or peso_kg < 20 or peso_kg > 400 or altura_cm < 80 or altura_cm > 250:
        return jsonify({"error": "Los valores están fuera de un rango razonable."}), 400

    altura_m = altura_cm / 100.0
    imc = round(peso_kg / (altura_m * altura_m), 2)

    conn = get_conn()
    conn.execute(
        """
        INSERT INTO imc_registros (user_id, nombre, edad, sexo, peso_kg, altura_cm, imc)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (session["user_id"], nombre, edad, sexo, peso_kg, altura_cm, imc),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Registro guardado.", "imc": imc}), 201


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Sesión cerrada correctamente."})


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
