CREATE TABLE `user` (
  `id` int PRIMARY KEY,
  `keycloak_id` varchar(255) UNIQUE NOT NULL,
  `username` varchar(255) UNIQUE NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `phone` varchar(255),
  `address` varchar(255),
  `website` varchar(255),
  `birthday` date,
  `created_at` datetime,
  `bio` varchar(255),
  `profile_pic` varchar(255),
  `user_type` varchar(255)
);

CREATE TABLE `post` (
  `id` int PRIMARY KEY,
  `content` text NOT NULL,
  `image` varchar(255),
  `timestamp` datetime,
  `user_id` int NOT NULL
);

CREATE TABLE `comment` (
  `id` int PRIMARY KEY,
  `content` text NOT NULL,
  `timestamp` datetime,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL
);

CREATE TABLE `like` (
  `id` int PRIMARY KEY,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL
);

CREATE TABLE `reaction` (
  `id` int PRIMARY KEY,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `reaction_type` varchar(255) NOT NULL
);

CREATE TABLE `follow` (
  `id` int PRIMARY KEY,
  `follower_id` int NOT NULL,
  `followed_id` int NOT NULL
);

CREATE TABLE `professional_details` (
  `id` int PRIMARY KEY,
  `user_id` int UNIQUE NOT NULL,
  `license` varchar(255),
  `specialization` varchar(255)
);

CREATE TABLE `chat` (
  `id` int PRIMARY KEY,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text NOT NULL,
  `timestamp` datetime
);

CREATE TABLE `email_notification_settings` (
  `id` int PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `setting_id` varchar(255) NOT NULL,
  `value` boolean
);

CREATE TABLE `profile_visibility_settings` (
  `id` int PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `setting_id` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL
);

ALTER TABLE `post` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `comment` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `comment` ADD FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);

ALTER TABLE `like` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `like` ADD FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);

ALTER TABLE `reaction` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `reaction` ADD FOREIGN KEY (`post_id`) REFERENCES `post` (`id`);

ALTER TABLE `follow` ADD FOREIGN KEY (`follower_id`) REFERENCES `user` (`id`);

ALTER TABLE `follow` ADD FOREIGN KEY (`followed_id`) REFERENCES `user` (`id`);

ALTER TABLE `professional_details` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `chat` ADD FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`);

ALTER TABLE `chat` ADD FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`);

ALTER TABLE `email_notification_settings` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`keycloak_id`);

ALTER TABLE `profile_visibility_settings` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`keycloak_id`);
