from flask import request, jsonify
from flask_restx import Namespace, Resource
from app.utils import require_auth

api = Namespace("device", description="Device Token Endpoints")

@api.route("/register-device-token")
class RegisterDeviceToken(Resource):
    from .device_token_model import RegisterDeviceTokenModel, MessageModel
    @api.marshal_with(MessageModel)
    @require_auth()
    @api.expect(RegisterDeviceTokenModel)
    def post(self):
        from app.models import DeviceToken, User, db
        data = request.get_json()
        token = data.get("token")
        platform = data.get("platform")
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user or not token:
            return {"message": "Invalid request"}, 400

        # Upsert logic: update if exists, else create
        device_token = DeviceToken.query.filter_by(token=token).first()
        if device_token:
            device_token.user_id = user.id
            device_token.platform = platform
        else:
            device_token = DeviceToken(user_id=user.id, token=token, platform=platform)
            db.session.add(device_token)
        db.session.commit()
        return {"message": "Device token registered"}, 200

@api.route("/my-device-tokens")
class ListDeviceTokens(Resource):
    from .device_token_model import DeviceTokenListModel
    @require_auth()
    @api.marshal_with(DeviceTokenListModel)
    def get(self):
        from app.models import DeviceToken, User
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
        tokens = DeviceToken.query.filter_by(user_id=user.id).all()
        return {
            "device_tokens": [
                {"id": t.id, "token": t.token, "platform": t.platform, "created_at": t.created_at.isoformat()}
                for t in tokens
            ]
        }, 200

@api.route("/delete-device-token/<int:token_id>")
class DeleteDeviceToken(Resource):
    from .device_token_model import MessageModel
    @require_auth()
    @api.marshal_with(MessageModel)
    def delete(self, token_id):
        from app.models import DeviceToken, User, db
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
        device_token = DeviceToken.query.filter_by(id=token_id, user_id=user.id).first()
        if not device_token:
            return {"message": "Device token not found"}, 404
        db.session.delete(device_token)
        db.session.commit()
        return {"message": "Device token deleted"}, 200