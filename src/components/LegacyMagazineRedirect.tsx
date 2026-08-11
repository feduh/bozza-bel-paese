import { Navigate, useParams } from "react-router-dom";

/** Redirect delle vecchie rotte /magazine/:slug verso /bollettino/:slug */
const LegacyMagazineRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/bollettino/${slug}` : "/bollettino"} replace />;
};

export default LegacyMagazineRedirect;
