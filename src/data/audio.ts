import homeBgm from '../assets/audio/domartistudios-magic-forest-473582.mp3'
import prologueBgm from '../assets/audio/syouki_takahashi-midnight-forest-184304.mp3'
import departureBgm from '../assets/audio/deuslower-fantasy-medieval-mystery-ambient-292418.mp3'
import investigationBgm from '../assets/audio/ovrsoull-dark-ambient-cinematic-drone-investigative-pulse-minimalist-tension-454723.mp3'
import revelationBgm from '../assets/audio/romansenykmusic-cinematic-fantasy-dark-160932.mp3'
import dangerBgm from '../assets/audio/wbmstudio-dramatic-tension-dark-cinematic-tension-467871.mp3'
import finaleBgm from '../assets/audio/sigmaeffect-cinematic-dark-tension-atmosphere-464380.mp3'
import victoryBgm from '../assets/audio/paulyudin-hopeful-piano-emotional-158606.mp3'
import hiddenBgm from '../assets/audio/royaltyfreemusicstudio-hopeful-cinematic-journey-506057.mp3'
import failBgm from '../assets/audio/megalix-dark-ambient-for-crime-and-tension-360762.mp3'
import type { BgmCue } from '../types/game'

export const bgmSources: Record<BgmCue, string> = {
  home: homeBgm,
  prologue: prologueBgm,
  departure: departureBgm,
  investigation: investigationBgm,
  revelation: revelationBgm,
  danger: dangerBgm,
  finale: finaleBgm,
  victory: victoryBgm,
  hidden: hiddenBgm,
  fail: failBgm
}
