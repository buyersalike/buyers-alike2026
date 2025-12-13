import Home from './pages/Home';
import Partnerships from './pages/Partnerships';
import Opportunities from './pages/Opportunities';
import Recommendations from './pages/Recommendations';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Partnerships": Partnerships,
    "Opportunities": Opportunities,
    "Recommendations": Recommendations,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};