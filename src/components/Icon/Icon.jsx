import React, { Suspense } from "react";
import PropTypes from "prop-types";
import Loading from "../Loading/Loading";

const icons = {
  sound: React.lazy(() => import("./Svgs/Sound")),
  music: React.lazy(() => import("./Svgs/Music")),
  questionMark: React.lazy(async () => import("./Svgs/QuestionMark")),
  copyright: React.lazy(() => import("./Svgs/Copyright")),
  gitHub: React.lazy(() => import("./Svgs/GitHub")),
};

Icon.propTypes = {
  type: PropTypes.oneOf(Object.keys(icons)).isRequired,
  className: PropTypes.string,
};

export default function Icon({ type, ...props }) {
  const className = `icon ${props.className ?? ""}`.trim();
  const iconProps = { ...props, className };
  return (
    <Suspense fallback={<Loading />}>
      {icons[type] ? React.createElement(icons[type], iconProps) : null}
    </Suspense>
  );
}
