from flask_restx import fields
from .device_token_routes import api

RegisterDeviceTokenModel = api.model("RegisterDeviceToken", {
    "token": fields.String(required=True, description="Device push token"),
    "platform": fields.String(required=True, description="Device platform (ios/android)")
})

DeviceTokenModel = api.model("DeviceToken", {
    "id": fields.Integer(description="Token ID"),
    "token": fields.String(description="Device push token"),
    "platform": fields.String(description="Device platform"),
    "created_at": fields.String(description="Token registration date/time (ISO format)")
})

DeviceTokenListModel = api.model("DeviceTokenList", {
    "device_tokens": fields.List(fields.Nested(DeviceTokenModel))
})

MessageModel = api.model("Message", {
    "message": fields.String(description="Response message")
})