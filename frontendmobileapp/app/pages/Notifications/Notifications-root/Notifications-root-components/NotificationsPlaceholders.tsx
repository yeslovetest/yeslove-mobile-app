import profileImg1 from "../../../../../assets/images/profileImg1.jpg";
import profileImg2 from "../../../../../assets/images/profileImg2.jpg";
import profileImg3 from "../../../../../assets/images/profileImg3.jpg";
import profileImg4 from "../../../../../assets/images/profileImg4.jpg";
import profileImg5 from "../../../../../assets/images/profileImg5.jpg";
import profileImg6 from "../../../../../assets/images/profileImg6.jpg";
import { ImageSourcePropType } from 'react-native';

export interface AppNotification {
  profileImage: ImageSourcePropType;
  postImage: ImageSourcePropType;
  user: string;
  notificationMessage: string;
  timeReceived: string;
  opened: boolean;
}

const NotificationsPlaceholders: AppNotification[] = [
  {
    profileImage: profileImg1,
    postImage: profileImg2,
    user: "Susan",
    notificationMessage: "liked your photo.",
    timeReceived: "10 mins ago",
    opened: false,
  },
  {
    profileImage: profileImg2,
    postImage: profileImg3,
    user: "Stacey",
    notificationMessage: "commented: 'This looks amazing!'",
    timeReceived: "25 mins ago",
    opened: false,
  },
  {
    profileImage: profileImg3,
    postImage: profileImg4,
    user: "James",
    notificationMessage: "started following you.",
    timeReceived: "1 hr ago",
    opened: true,
  },
  {
    profileImage: profileImg4,
    postImage: profileImg5,
    user: "Emily",
    notificationMessage: "mentioned you in a comment.",
    timeReceived: "3 hrs ago",
    opened: false,
  },
  {
    profileImage: profileImg5,
    postImage: profileImg6,
    user: "Rachel",
    notificationMessage: "shared your post.",
    timeReceived: "1 day ago",
    opened: true,
  },
  {
    profileImage: profileImg6,
    postImage: profileImg1,
    user: "Molly",
    notificationMessage: "reacted ❤️ to your story.",
    timeReceived: "2 days ago",
    opened: true,
  },
];

export default NotificationsPlaceholders;
