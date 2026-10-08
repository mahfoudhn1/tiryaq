"""Role constants and the demo accounts the login screen offers."""

STUDENT = "STUDENT"
INSTRUCTOR = "INSTRUCTOR"
ADMIN = "ADMIN"

ROLE_CHOICES = [
    (STUDENT, "Student"),
    (INSTRUCTOR, "Instructor"),
    (ADMIN, "Administrator"),
]

DEMO_ACCOUNTS = {
    STUDENT: {
        "email": "Aya.Zmt@tiryaq.com",
        "name": "Aya Zmt",
        "year": "MS-V",
    },
    INSTRUCTOR: {
        "email": "amine.haddad@tiryaq.com",
        "name": "Dr. Amine Haddad",
        "specialty": "Cardiology",
    },
    ADMIN: {
        "email": "admin@tiryaq.com",
        "name": "Admin User",
    },
}


def demo_email_for_role(role: str) -> str | None:
    account = DEMO_ACCOUNTS.get((role or "").upper())
    return account["email"] if account else None
