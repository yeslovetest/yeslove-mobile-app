# Keycloak Export

## export_keycloak.sh
Is an executable (will need to be run with wsl if on windows) that takes the current keycloak auth realm and exports its data into a json file which is then used for initialising the auth realm next time it is set up. (See backend/docker-compose.yaml)

It operates by doing the following:
- uses the admin login to gain an access token for keycloak
- collects the realm config data as JSON
- collects the realm user data as JSON
- combines these two responses into one
- rewrites YesLove_Auth-realm.json

On linux to export your current keycloak realm just run export_keycloak.sh from terminal with the docker server running.

### Note: I have only implemented the config and users so any other features we decide to use will be lost atm - Sam