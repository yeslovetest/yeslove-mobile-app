```mermaid
%% GitHub-compatible Mermaid Diagram
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
            uiComp1["UI Components"] -->|Includes| login1
            uiComp1 -->|Includes| tabs1
            uiComp1 -->|Includes| features1
        end
        entry1 --> uiComp1
        entry1 --> state1
        entry1 --> api1
        entry1 --> hooks1
        entry1 --> styling1
    end

    subgraph backend1["Backend System<br>Flask, Python"]
        migrations1["Database Migrations<br>Alembic"]
        models1["Database Models<br>SQLAlchemy"]
        subgraph chatbot1["Chatbot Package<br>Python"]
            kb1["Knowledge Base<br>Markdown, Text"]
            vector1["Vector Store<br>Python"]
            chatbotMain1["Chatbot"] --> kb1
            chatbotMain1 --> vector1
        end
        subgraph apis1["API Endpoints<br>Flask-RESTful"]
            auth1["Authentication API"]
            blog1["Blog API"]
            chat1["Chat API"]
            chatbotAPI1["Chatbot API"]
            device1["Device Token API"]
            feed1["Feed API"]
            profile1["Profile API"]
        end
    end

    %% External connections
    frontendWeb1 --> kc1
    frontendWeb1 --> auth1
    frontendMobile1 --> kc1
    frontendMobile1 --> auth1
    user1 --> frontendWeb1
    user1 --> frontendMobile1
    api1 --> auth1
