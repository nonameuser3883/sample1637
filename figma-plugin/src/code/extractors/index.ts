import type { Aspect, FullDSSection } from '../../shared/messages';
import type { AspectExtractor, FullDSExtractor } from './types';
import { extractTypography } from './aspects/typography';
import { extractBackground } from './aspects/background';
import { extractBorder } from './aspects/border';
import { extractShadow } from './aspects/shadow';
import { extractRadius } from './aspects/radius';
import { extractSpacing } from './aspects/spacing';
import { extractLayout } from './aspects/layout';
import { extractIcon } from './aspects/icon';
import { extractButton } from './aspects/button';
import { extractButtonPremium } from './aspects/buttonPremium';
import { extractInput } from './aspects/input';
import { extractCard } from './aspects/card';
import { extractComponentSet } from './aspects/componentSet';
import { extractFrame } from './aspects/frame';
import { extractScreen } from './aspects/screen';
import { extractSurface } from './aspects/surface';
import { extractBackdrop } from './aspects/backdrop';
import { extractStack } from './aspects/stack';
import { extractAll } from './aspects/all';
import { extractAllTextStyles } from './fullDS/textStyles';
import { extractAllPaintStyles } from './fullDS/paintStyles';
import { extractAllEffectStyles } from './fullDS/effectStyles';
import { extractAllColorVariables } from './fullDS/colorVariables';
import { extractAllNumberVariables } from './fullDS/numberVariables';
import { extractAllLocalComponents } from './fullDS/localComponents';
import { extractAllIcons } from './fullDS/icons';

export const ASPECT_EXTRACTORS: Record<Aspect, AspectExtractor> = {
  typography: extractTypography,
  background: extractBackground,
  border: extractBorder,
  shadow: extractShadow,
  radius: extractRadius,
  spacing: extractSpacing,
  layout: extractLayout,
  icon: extractIcon,
  surface: extractSurface,
  backdrop: extractBackdrop,
  stack: extractStack,
  button: extractButton,
  buttonPremium: extractButtonPremium,
  input: extractInput,
  card: extractCard,
  componentSet: extractComponentSet,
  frame: extractFrame,
  screen: extractScreen,
  all: extractAll
};

export const FULLDS_EXTRACTORS: Record<FullDSSection, FullDSExtractor> = {
  textStyles: extractAllTextStyles,
  paintStyles: extractAllPaintStyles,
  effectStyles: extractAllEffectStyles,
  colorVariables: extractAllColorVariables,
  numberVariables: extractAllNumberVariables,
  localComponents: extractAllLocalComponents,
  icons: extractAllIcons
};
