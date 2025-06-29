from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from markupsafe import Markup
from flask import url_for
from .models import db, ProfessionalDetails, User

class ProfessionalDetailsAdmin(ModelView):
    # Columns displayed in list view
    column_list = (
        "user.username",
        "license_body", 
        "license_number",
        "is_verified",
        "verified_at",
        "next_reverify_date",
    )

    # Enables filtering and searching
    column_filters = ("is_verified", "next_reverify_date")
    column_searchable_list = ("user.username", "license_number")

    # Ensures user relationship is not shown
    form_excluded_columns = ("user",)

    # Make license_number be a clickable link to an external registry
    # Currently leads to search homepage of whichever governing body
    # Future updates will lead directily to the users license 

    def _format_license(view, context, model, name):
        registry_urls = {
            "HCPC" : "https://www.hcpc-uk.org/check-the-register/",
            "BACP" : "https://www.bacp.co.uk/search/Register",
            "UKCP" : "https://psychotherapy.my.site.com/s/searchdirectory?id=a3VTl000001Sd97"
        }
        url = registry_urls.get(model.license_body, "#").format(model.license_number)
        return Markup(f'<a href="{url}" target="_blank">{model.license_number}</a>')
    
    column_formatters = {
        "license_number" : _format_license
    }

    # Automatically set verified_at and next_reverify_date when toggling is_verified
    def on_model_change(self, form, model, is_created):
        from datetime import datetime, date
        from dateutil.relativedelta import relativedelta

        if model.is_verified and model.verified_at is None:
            model.verified_at = datetime.now()

            # Schedule next reverify 6 months ahead by default
            model.next_reverify_date = date.today() + relativedelta(months=6)
        elif not model.is_verified:
            model.verified_at = None
            model.next_reverify_date = None
        return super().on_model_change(form, model, is_created)
    
def init_admin(app):
    admin = Admin(
        app, 
        name="Internal Admin",
        template_mode = "bootstrap4",
        url="/internal-admin"
    )
    admin.add_view(ProfessionalDetailsAdmin(ProfessionalDetails, db.session, category="Users"))
