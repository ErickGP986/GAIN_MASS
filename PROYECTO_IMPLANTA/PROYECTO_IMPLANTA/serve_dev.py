#!/usr/bin/env python3
"""
Servidor local para desarrollo: archivos estáticos + API en memoria.
Uso: python serve_dev.py
Luego abre http://localhost:8080/index.html
"""
from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

DIR = os.path.dirname(os.path.abspath(__file__))

users: dict[str, dict] = {}
sessions: dict[str, str] = {}
imc_by_email: dict[str, dict] = {}
recovery_codes: dict[str, str] = {}
_next_uid = 0


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def next_id() -> int:
    global _next_uid
    _next_uid += 1
    return _next_uid


def mask_email(email: str) -> str:
    if "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if len(local) <= 1:
        return f"*@{domain}"
    return f"{local[0]}***@{domain}"


def read_json(handler: SimpleHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length", 0) or 0)
    if not length:
        return {}
    raw = handler.rfile.read(length).decode("utf-8")
    if not raw.strip():
        return {}
    return json.loads(raw)


def send_json(handler: SimpleHTTPRequestHandler, status: int, obj: dict) -> None:
    body = json.dumps(obj).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def session_email(handler: SimpleHTTPRequestHandler) -> str | None:
    cookie = handler.headers.get("Cookie") or ""
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("gm_session="):
            token = part.split("=", 1)[1].strip()
            return sessions.get(token)
    return None


def set_session_cookie(handler: SimpleHTTPRequestHandler, token: str) -> None:
    handler.send_header(
        "Set-Cookie",
        f"gm_session={token}; Path=/; HttpOnly; SameSite=Lax",
    )


def clear_session_cookie(handler: SimpleHTTPRequestHandler) -> None:
    handler.send_header("Set-Cookie", "gm_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_GET(self) -> None:
        path = urlparse(self.path).path

        if path == "/api/me":
            email = session_email(self)
            if not email or email not in users:
                send_json(self, 200, {"authenticated": False})
                return
            u = users[email]
            send_json(
                self,
                200,
                {
                    "authenticated": True,
                    "usuario": {
                        "nombre": u["nombre"],
                        "correo": u["correo"],
                        "premium": u.get("premium", False),
                    },
                },
            )
            return

        if path == "/api/imc/latest":
            email = session_email(self)
            if not email:
                send_json(self, 200, {"registro": None})
                return
            reg = imc_by_email.get(email)
            send_json(self, 200, {"registro": reg})
            return

        if path == "/api/users":
            if not session_email(self):
                send_json(self, 401, {"error": "No autorizado"})
                return
            lista = []
            for u in users.values():
                lista.append(
                    {
                        "id": u["id"],
                        "nombre": u["nombre"],
                        "correo": u["correo"],
                        "telefono": u.get("telefono") or "",
                        "correo_respaldo": u.get("correo_respaldo") or "",
                        "premium": u.get("premium", False),
                        "creado_en": u.get("creado_en") or "",
                    }
                )
            body = json.dumps(lista).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        super().do_GET()

    def do_POST(self) -> None:
        path = urlparse(self.path).path

        try:
            data = read_json(self)
        except json.JSONDecodeError:
            send_json(self, 400, {"error": "JSON inválido"})
            return

        if path == "/api/register":
            nombre = (data.get("nombre") or "").strip()
            correo = (data.get("correo") or "").strip().lower()
            contrasena = data.get("contrasena") or ""
            telefono = (data.get("telefono") or "").strip()
            correo_respaldo = (data.get("correo_respaldo") or "").strip()

            if not nombre or not correo:
                send_json(self, 400, {"error": "Nombre y correo son obligatorios."})
                return
            if len(contrasena) < 6:
                send_json(self, 400, {"error": "La contraseña debe tener al menos 6 caracteres."})
                return
            if correo in users:
                send_json(self, 400, {"error": "Este correo ya está registrado."})
                return

            users[correo] = {
                "id": next_id(),
                "nombre": nombre,
                "correo": correo,
                "contrasena": contrasena,
                "telefono": telefono,
                "correo_respaldo": correo_respaldo,
                "premium": False,
                "creado_en": utc_now(),
            }
            send_json(self, 200, {})
            return

        if path == "/api/login":
            correo = (data.get("correo") or "").strip().lower()
            contrasena = data.get("contrasena") or ""
            u = users.get(correo)
            if not u or u["contrasena"] != contrasena:
                send_json(self, 401, {"error": "Correo o contraseña incorrectos."})
                return

            token = secrets.token_urlsafe(32)
            sessions[token] = correo
            body = json.dumps(
                {
                    "usuario": {
                        "nombre": u["nombre"],
                        "correo": u["correo"],
                        "premium": u.get("premium", False),
                    }
                }
            ).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            set_session_cookie(self, token)
            self.end_headers()
            self.wfile.write(body)
            return

        if path == "/api/logout":
            cookie = self.headers.get("Cookie") or ""
            for part in cookie.split(";"):
                part = part.strip()
                if part.startswith("gm_session="):
                    token = part.split("=", 1)[1].strip()
                    sessions.pop(token, None)
                    break
            self.send_response(200)
            clear_session_cookie(self)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", "2")
            self.end_headers()
            self.wfile.write(b"{}")
            return

        if path == "/api/recovery-start":
            correo = (data.get("correo") or "").strip().lower()
            if correo not in users:
                send_json(self, 404, {"error": "No hay cuenta con ese correo."})
                return
            code = f"{secrets.randbelow(900000) + 100000}"
            recovery_codes[code] = correo
            send_json(
                self,
                200,
                {"destino": mask_email(correo), "demo_code": code},
            )
            return

        if path == "/api/recovery-reset":
            codigo = (data.get("codigo") or "").strip()
            nueva = data.get("nueva_contrasena") or ""
            email = recovery_codes.get(codigo)
            if not email or email not in users:
                send_json(self, 400, {"error": "Código inválido o expirado."})
                return
            if len(nueva) < 6:
                send_json(self, 400, {"error": "La contraseña debe tener al menos 6 caracteres."})
                return
            users[email]["contrasena"] = nueva
            del recovery_codes[codigo]
            send_json(self, 200, {})
            return

        if path == "/api/imc":
            email = session_email(self)
            if not email:
                send_json(self, 401, {"error": "Debes iniciar sesión."})
                return

            nombre = (data.get("nombre") or "").strip()
            edad = int(data.get("edad") or 0)
            sexo = (data.get("sexo") or "").strip()
            peso_kg = float(data.get("peso_kg") or 0)
            altura_cm = float(data.get("altura_cm") or 0)

            if not nombre or not sexo or peso_kg <= 0 or altura_cm <= 0:
                send_json(self, 400, {"error": "Datos incompletos o inválidos."})
                return

            altura_m = altura_cm / 100.0
            imc_val = round(peso_kg / (altura_m**2), 1)

            reg = {
                "nombre": nombre,
                "edad": edad,
                "sexo": sexo,
                "peso_kg": peso_kg,
                "altura_cm": altura_cm,
                "imc": imc_val,
                "creado_en": utc_now(),
            }
            imc_by_email[email] = reg
            send_json(self, 200, {"imc": imc_val})
            return

        self.send_error(404, "Not Found")


def main() -> None:
    port = int(os.environ.get("PORT", "8080"))
    server = HTTPServer(("127.0.0.1", port), DevHandler)
    print(f"Serving GAIN MASS (dev) en http://127.0.0.1:{port}/index.html")
    print("Datos en memoria: al cerrar el script se pierden usuarios/IMC.")
    server.serve_forever()


if __name__ == "__main__":
    main()
