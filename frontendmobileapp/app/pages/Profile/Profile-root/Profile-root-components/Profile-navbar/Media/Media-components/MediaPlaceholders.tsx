import profileImg1 from "../../../../../../../../assets/images/profileImg1.jpg";
import profileImg2 from "../../../../../../../../assets/images/profileImg2.jpg";
import profileImg3 from "../../../../../../../../assets/images/profileImg3.jpg";
import profileImg4 from "../../../../../../../../assets/images/profileImg4.jpg";
import profileImg5 from "../../../../../../../../assets/images/profileImg5.jpg";
import profileImg6 from "../../../../../../../../assets/images/profileImg6.jpg";
import { ImageSourcePropType } from "react-native";

export interface Media {
  image: ImageSourcePropType;
}

const MediaPlaceholders: Media[] = [
  {
    image: profileImg1,
  },
  {
    image: profileImg2,
  },
  {
    image: profileImg3,
  },
  {
    image: profileImg4,
  },
  {
    image: profileImg5,
  },
  {
    image: profileImg6,
  },
];

export default MediaPlaceholders;
