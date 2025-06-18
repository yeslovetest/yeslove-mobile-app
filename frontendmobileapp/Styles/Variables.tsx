import { vw } from "../ts/viewport-units"

const theme = {
    colors: {
        /*main shade of blue used across the app including active nav headings and footer icons */
        primaryBlue: "#2d5be3",
        /*shade of orange used in the banners on the get help and home page */
        bannerOrange: "#E49114",
        /*icon not active on footer and navbar item not active on profile and home page */
        iconNotActive: "#666",
        /*text colour on orange banner on get help and home page */
        bannerTextColor: "#fff",
        /*border colour of user info on profile page */
        viewEditBorderColor: "#f1f1f1",

        /*main background colour for login & signup screen components including text-box and buttons */
        mainBkgColor: "#fff",
        /*main font colour for login & signup screen container footer  */
        footerFontColor: 'rgb(100,100,100)',
        /*border colour for login & signup screen container footer  */
        footerBdColor: 'rgb(192, 187, 187)',
        /*background colour of text boxes in individual event tabs */
        eventTextBackground: "#fefefe"
    },
  
    spacing: {
        /*width of posts, postbox, banner, and most component parent elements*/
        postWidth: vw(90),
        standardPageContentWidth: "90%",
        eventTextBoxPadding: 15,
    }
}

export default theme