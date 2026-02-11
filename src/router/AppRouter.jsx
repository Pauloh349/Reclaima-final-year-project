import { BrowserRouter, Route, Routes } from "react-router-dom";

import Welcome from "../screens/Welcome";
import SignUp from "../screens/SignUp";
import ReportLost from "../screens/PostLost";
import Home from "../screens/Home";
import SelectZone from "../screens/SelectZone";
import ReportFound from "../screens/PostFound";
import SmartMatches from "../screens/SmartMatches";
import ItemDetails from "../screens/ItemDetails";
import ProfileSettings from "../screens/Profile";
import ChatPage from "../screens/Chat";
import SignIn from "../screens/SignIn";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import TermsOfService from "../screens/TermsOfService";
import HelpCenter from "../screens/HelpCenter";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lost" element={<ReportLost />} />
        <Route path="/lost/zone" element={<SelectZone />} />
        <Route path="/found" element={<ReportFound />} />
        <Route path="/matches" element={<SmartMatches />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
