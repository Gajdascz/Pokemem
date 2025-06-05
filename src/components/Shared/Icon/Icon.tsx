import React, { Suspense } from 'react';
import {
  Cog,
  CopyRight,
  Github,
  Music,
  QuestionMark,
  Sound,
  Save
} from './svgs/index';

const icons = {
  copyRight: CopyRight,
  github: Github,
  music: Music,
  questionMark: QuestionMark,
  sound: Sound,
  cog: Cog,
  save: Save
} as const;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  type: keyof typeof icons;
}
export default function Icon({ type, ...props }: IconProps) {
  const className = `icon ${props.className ?? ''}`.trim();
  const I = icons[type];
  return <I {...props} className={className} />;
}
