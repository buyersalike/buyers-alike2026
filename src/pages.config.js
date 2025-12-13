import Home from './pages/Home';
import Partnerships from './pages/Partnerships';
import Opportunities from './pages/Opportunities';
import Recommendations from './pages/Recommendations';
import Vendors from './pages/Vendors';
import Messages from './pages/Messages';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Partnerships": Partnerships,
    "Opportunities": Opportunities,
    "Recommendations": Recommendations,
    "Vendors": Vendors,
    "Messages": Messages,
    "Forum": Forum,
    "PostDetail": PostDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};