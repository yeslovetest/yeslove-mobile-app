import boto3
import json
import os
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

class AWSConfigManager:
    def __init__(self):
        region = os.getenv("AWS_REGION", "eu-west-2")
        self.secrets_client = boto3.client('secretsmanager', region_name=region)
        self.ssm_client = boto3.client('ssm', region_name=region)
        self._secrets_cache = {}
        self._params_cache = {}
    
    def get_secret(self, secret_name):
        """Get secret from AWS Secrets Manager"""
        if secret_name in self._secrets_cache:
            return self._secrets_cache[secret_name]
        
        try:
            response = self.secrets_client.get_secret_value(SecretId=secret_name)
            secret = json.loads(response['SecretString'])
            self._secrets_cache[secret_name] = secret
            return secret
        except ClientError as e:
            print(f"Error retrieving secret {secret_name}: {e}")
            return None
    
    def get_parameter(self, parameter_name, decrypt=False):
        """Get parameter from Systems Manager Parameter Store"""
        cache_key = f"{parameter_name}_{decrypt}"
        if cache_key in self._params_cache:
            return self._params_cache[cache_key]
        
        try:
            response = self.ssm_client.get_parameter(
                Name=parameter_name,
                WithDecryption=decrypt
            )
            value = response['Parameter']['Value']
            self._params_cache[cache_key] = value
            return value
        except ClientError as e:
            print(f"Error retrieving parameter {parameter_name}: {e}")
            return None

# Global instance
aws_config = AWSConfigManager()

def get_config_value(key, default=None):
    """Get configuration value from AWS or environment fallback"""
    # Try environment first (for local development)
    env_value = os.getenv(key)
    if env_value:
        return env_value
    
    # Try Secrets Manager for sensitive data
    secrets = aws_config.get_secret('yeslove/secrets')
    if secrets and key in secrets:
        return secrets[key]
    
    # Try Parameter Store for configuration
    param_value = aws_config.get_parameter(f'/yeslove/{key}')
    if param_value:
        return param_value
    
    return default