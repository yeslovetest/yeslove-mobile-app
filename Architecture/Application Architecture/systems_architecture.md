```mermaid
%% System Architecture Diagram
graph TD
    user1["User<br>External Actor"]
    user2["User<br>External Actor"]

    subgraph keycloak1["KeyCloak Service<br>Keycloak, Docker"]
        kc1["KeyCloak Instance<br>Keycloak"]
    end

    subgraph frontendWeb1["Frontend Web App System<br>React, JavaScript"]
        reactWeb1["React Application Structure<br>React"]
    end

    subgraph frontendMobile1["Frontend Mobile App System<br>React Native, Expo"]
        entry1["Application Entry Point & Navigation<br>React Native, Expo Router"]
        state1["State Management<br>Redux Toolkit"]
        api1["API Integration<br>TypeScript, OpenAPI"]
        hooks1["Hooks<br>React"]
        styling1["Styling<br>TypeScript, React Native"]
        subgraph ui1["UI Components<br>React Native"]
            login1["Login & Signup Screens<br>React Native"]
            tabs1["Tab Navigation<br>React Native, Expo Router"]
            features1["Feature-Specific Components<br>React Native"]
            uiComp1["UI Components<br>React Native"] -->|Includes| login1
            uiComp1 -->|Includes| tabs1
            uiComp1 -->|Includes| features1
        end
        entry1 -->|Uses| uiComp1
        entry1 -->|Manages state with| state1
        entry1 -->|Uses| api1
        entry1 -->|Uses| hooks1
        entry1 -->|Applies| styling1
    end

    subgraph keycloak2["KeyCloak Service<br>Keycloak, Docker"]
        kc2["KeyCloak Instance<br>Keycloak"]
    end

    subgraph frontendWeb2["Frontend Web App System<br>React, JavaScript"]
        reactWeb2["React Application Structure<br>React"]
    end

    subgraph frontendMobile2["Frontend Mobile App System<br>React Native, Expo"]
        entry2["Application Entry Point & Navigation<br>React Native, Expo Router"]
        state2["State Management<br>Redux Toolkit"]
        api2["API Integration<br>TypeScript, OpenAPI"]
        hooks2["Hooks<br>React"]
        styling2["Styling<br>TypeScript, React Native"]
        subgraph ui2["UI Components<br>React Native"]
            login2["Login & Signup Screens<br>React Native"]
            tabs2["Tab Navigation<br>React Native, Expo Router"]
            features2["Feature-Specific Components<br>React Native"]
            uiComp2["UI Components<br>React Native"] -->|Includes| login2
            uiComp2 -->|Includes| tabs2
            uiComp2 -->|Includes| features2
        end
        entry2 -->|Uses| uiComp2
        entry2 -->|Manages state with| state2
        entry2 -->|Uses| api2
        entry2 -->|Uses| hooks2
        entry2 -->|Applies| styling2
    end

    subgraph backend2["Backend System<br>Flask, Python"]
        migrations2["Database Migrations<br>Alembic"]
        subgraph core2["Flask Application Core<br>Python, Flask"]
            models2["Database Models<br>SQLAlchemy"]
            subgraph chatbot2["Chatbot Package<br>Python"]
                kb2["Knowledge Base<br>Markdown, Text"]
                vector2["Vector Store<br>Python"]
                chatbot2 -->|Uses| kb2
                chatbot2 -->|Uses| vector2
            end
            subgraph apis2["API Endpoints<br>Flask-RESTful"]
                auth2["Authentication API<br>Flask"]
                blog2["Blog API<br>Flask"]
                chat2["Chat API<br>Flask"]
                chatbotAPI2["Chatbot API<br>Flask"]
                device2["Device Token API<br>Flask"]
                feed2["Feed API<br>Flask"]
                profile2["Profile API<br>Flask"]
                apis2 -->|Uses| auth2
                apis2 -->|Uses| blog2
                apis2 -->|Uses| chat2
                apis2 -->|Uses| chatbotAPI2
                apis2 -->|Uses| device2
                apis2 -->|Uses| feed2
                apis2 -->|Uses| profile2
            end
            core2 -->|Integrates with| chatbot2
            core2 -->|Exposes| apis2
            core2 -->|Uses| models2
        end
        core2 -->|Manages schema with| migrations2
    end

    subgraph backend1["Backend System<br>Flask, Python"]
        migrations1["Database Migrations<br>Alembic"]
        subgraph core1["Flask Application Core<br>Python, Flask"]
            models1["Database Models<br>SQLAlchemy"]
            subgraph chatbot1["Chatbot Package<br>Python"]
                kb1["Knowledge Base<br>Markdown, Text"]
                vector1["Vector Store<br>Python"]
                chatbot1 -->|Uses| kb1
                chatbot1 -->|Uses| vector1
            end
            subgraph apis1["API Endpoints<br>Flask-RESTful"]
                auth1["Authentication API<br>Flask"]
                blog1["Blog API<br>Flask"]
                chat1["Chat API<br>Flask"]
                chatbotAPI1["Chatbot API<br>Flask"]
                device1["Device Token API<br>Flask"]
                feed1["Feed API<br>Flask"]
                profile1["Profile API<br>Flask"]
                apis1 -->|Uses| auth1
                apis1 -->|Uses| blog1
                apis1 -->|Uses| chat1
                apis1 -->|Uses| chatbotAPI1
                apis1 -->|Uses| device1
                apis1 -->|Uses| feed1
                apis1 -->|Uses| profile1
            end
            core1 -->|Integrates with| chatbot1
            core1 -->|Exposes| apis1
            core1 -->|Uses| models1
        end
        core1 -->|Manages schema with| migrations1
    end

    %% Connections
    frontendWeb1 -->|Authenticates via| keycloak1
    frontendWeb1 -->|Consumes API| backend1
    frontendMobile1 -->|Authenticates via| keycloak1
    frontendMobile1 -->|Consumes API| backend1
    backend1 -->|Validates tokens from| keycloak1
    user1 -->|Interacts with| frontendWeb1
    user1 -->|Interacts with| frontendMobile1
    api1 -->|Calls| backend1

    frontendWeb2 -->|Authenticates via| keycloak2
    frontendWeb2 -->|Consumes API| backend2
    frontendMobile2 -->|Authenticates via| keycloak2
    frontendMobile2 -->|Consumes API| backend2
    backend2 -->|Validates tokens from| keycloak2
    user2 -->|Interacts with| frontendWeb2
    user2 -->|Interacts with| frontendMobile2
    api2 -->|Calls| backend2
