```mermaid
%% System Architecture Diagram
graph TD
    39["User<br>External Actor"]
    9["User<br>External Actor"]

    subgraph 1["KeyCloak Service<br>Keycloak, Docker"]
        30["KeyCloak Instance<br>Keycloak"]
    end

    subgraph 2["Frontend Web App System<br>React, JavaScript"]
        29["React Application Structure<br>React"]
    end


    subgraph 3["Frontend Mobile App System<br>React Native, Expo"]
        21["Application Entry Point & Navigation<br>React Native, Expo Router"]
        25["State Management<br>Redux Toolkit"]
        26["API Integration<br>TypeScript, OpenAPI"]
        27["Hooks<br>React"]
        28["Styling<br>TypeScript, React Native"]
        subgraph 4["UI Components<br>React Native"]
            22["Login & Signup Screens<br>React Native"]
            23["Tab Navigation<br>React Native, Expo Router"]
            24["Feature-Specific Components<br>React Native"]
            4["UI Components<br>React Native"] -->|Includes| 22
            4 -->|Includes| 23
            4 -->|Includes| 24
        end
        21 -->|Uses| 4
        21 -->|Manages state with| 25
        21 -->|Uses| 26
        21 -->|Uses| 27
        21 -->|Applies| 28
    end

    subgraph 31["KeyCloak Service<br>Keycloak, Docker"]
        60["KeyCloak Instance<br>Keycloak"]
    end

    subgraph 32["Frontend Web App System<br>React, JavaScript"]
        59["React Application Structure<br>React"]
    end

    subgraph 33["Frontend Mobile App System<br>React Native, Expo"]
        51["Application Entry Point & Navigation<br>React Native, Expo Router"]
        55["State Management<br>Redux Toolkit"]
        56["API Integration<br>TypeScript, OpenAPI"]
        57["Hooks<br>React"]
        58["Styling<br>TypeScript, React Native"]
        subgraph 34["UI Components<br>React Native"]
            52["Login & Signup Screens<br>React Native"]
            53["Tab Navigation<br>React Native, Expo Router"]
            54["Feature-Specific Components<br>React Native"]
            34 -->|Includes| 52
            34 -->|Includes| 53
            34 -->|Includes| 54
        end
        51 -->|Uses| 34
        51 -->|Manages state with| 55
        51 -->|Uses| 56
        51 -->|Uses| 57
        51 -->|Applies| 58
    end

    subgraph 35["Backend System<br>Flask, Python"]
        50["Database Migrations<br>Alembic"]
        subgraph 36["Flask Application Core<br>Python, Flask"]
            40["Database Models<br>SQLAlchemy"]
            subgraph 37["Chatbot Package<br>Python"]
                48["Knowledge Base<br>Markdown, Text"]
                49["Vector Store<br>Python"]
                37 -->|Uses| 48
                37 -->|Uses| 49
            end
            subgraph 38["API Endpoints<br>Flask-RESTful"]
                41["Authentication API<br>Flask"]
                42["Blog API<br>Flask"]
                43["Chat API<br>Flask"]
                44["Chatbot API<br>Flask"]
                45["Device Token API<br>Flask"]
                46["Feed API<br>Flask"]
                47["Profile API<br>Flask"]
                38 -->|Uses| 41
                38 -->|Uses| 42
                38 -->|Uses| 43
                38 -->|Uses| 44
                38 -->|Uses| 45
                38 -->|Uses| 46
                38 -->|Uses| 47
            end
            36 -->|Integrates with| 37
            36 -->|Exposes| 38
            36 -->|Uses| 40
        end
        36 -->|Manages schema with| 50
    end

    subgraph 5["Backend System<br>Flask, Python"]
        20["Database Migrations<br>Alembic"]
        subgraph 6["Flask Application Core<br>Python, Flask"]
            10["Database Models<br>SQLAlchemy"]
            subgraph 7["Chatbot Package<br>Python"]
                18["Knowledge Base<br>Markdown, Text"]
                19["Vector Store<br>Python"]
                7 -->|Uses| 18
                7 -->|Uses| 19
            end
            subgraph 8["API Endpoints<br>Flask-RESTful"]
                11["Authentication API<br>Flask"]
                12["Blog API<br>Flask"]
                13["Chat API<br>Flask"]
                14["Chatbot API<br>Flask"]
                15["Device Token API<br>Flask"]
                16["Feed API<br>Flask"]
                17["Profile API<br>Flask"]
                8 -->|Uses| 11
                8 -->|Uses| 12
                8 -->|Uses| 13
                8 -->|Uses| 14
                8 -->|Uses| 15
                8 -->|Uses| 16
                8 -->|Uses| 17
            end
            6 -->|Integrates with| 7
            6 -->|Exposes| 8
            6 -->|Uses| 10
        end
        6 -->|Manages schema with| 20
    end

    2["Frontend Web App System<br>React, JavaScript"] -->|Authenticates via| 1
    2 -->|Consumes API| 5
    3["Frontend Mobile App System<br>React Native, Expo"] -->|Authenticates via| 1
    3 -->|Consumes API| 5
    5 -->|Validates tokens from| 1
    9 -->|Interacts with| 2
    9 -->|Interacts with| 3
    26 -->|Calls| 5

    32["Frontend Web App System<br>React, JavaScript"] -->|Authenticates via| 31
    32 -->|Consumes API| 35
    33["Frontend Mobile App System<br>React Native, Expo"] -->|Authenticates via| 31
    33 -->|Consumes API| 35
    35 -->|Validates tokens from| 31
    39 -->|Interacts with| 32
    39 -->|Interacts with| 33
    56 -->|Calls| 35
```