import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError(
                _("The password must contain at least one uppercase letter."),
                code='password_no_upper',
            )
        if not re.findall('[a-z]', password):
            raise ValidationError(
                _("The password must contain at least one lowercase letter."),
                code='password_no_lower',
            )
        if not re.findall('\d', password):
            raise ValidationError(
                _("The password must contain at least one digit."),
                code='password_no_digit',
            )
        if not re.findall('[^A-Za-z0-9]', password):
            raise ValidationError(
                _("The password must contain at least one special character."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least one uppercase letter, one lowercase letter, "
            "one digit, and one special character."
        )
