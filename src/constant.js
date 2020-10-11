global.REACTION={
    "OH":["H","O"],
    "ZK":["Z","K"],
    "UL":["U","L"],
    "G":["ZK","UL"],
    "UH":["U","H"],
    "UO":["U","O"],
    "KH":["K","H"],
    "KO":["K","O"],
    "LH":["L","H"],
    "LO":["L","O"],
    "ZH":["Z","H"],
    "ZO":["Z","O"],
    "GH":["G","H"],
    "GO":["G","O"],
    "UH2O":["UH","OH"],
    "UHO2":["UO","OH"],
    "KH2O":["KH","OH"],
    "KHO2":["KO","OH"],
    "LH2O":["LH","OH"],
    "LHO2":["LO","OH"],
    "ZH2O":["ZH","OH"],
    "ZHO2":["ZO","OH"],
    "GH2O":["GH","OH"],
    "GHO2":["GO","OH"],
    "XUH2O":["UH2O","X"],
    "XUHO2":["UHO2","X"],
    "XKH2O":["KH2O","X"],
    "XKHO2":["KHO2","X"],
    "XLH2O":["LH2O","X"],
    "XLHO2":["LHO2","X"],
    "XZH2O":["ZH2O","X"],
    "XZHO2":["ZHO2","X"],
    "XGH2O":["GH2O","X"],
    "XGHO2":["GHO2","X"]
}
global.MINERALS_EXTRACTABLE=[
  RESOURCE_HYDROGEN,
  RESOURCE_OXYGEN,
  RESOURCE_UTRIUM,
  RESOURCE_LEMERGIUM,
  RESOURCE_KEANIUM,
  RESOURCE_ZYNTHIUM,
  RESOURCE_CATALYST
]
global.RESOURCE_MINE=[
  'H','O','U','L','K','Z','X'
]
global.RESOURCE_DEPOSIT=[
  'silicon','metal','biomass','mist'
]
global.RESOURCE_MID=[
  'OH','ZK','UL'
]
global.RESOURCE_BAR=[
  'utrium_bar','lemergium_bar','zynthium_bar','keanium_bar','ghodium_melt','oxidant','reductant','purifier','battery'
]
global.RESOURCE_COMMODITY=[
  'wire','switch','transistor','microchip','circuit','device',
  'cell','phlegm','tissue','muscle','organoid','organism',
  'alloy','tube','fixtures','frame','hydraulics','machine',
  'condensate','concentrate','extract','spirit','emanation','essence'
]
global.silicon0='wire'
global.silicon1='switch'
global.silicon2='transistor'
global.silicon3='microchip'
global.silicon4='circuit'
global.silicon5='device'
global.metal0='alloy'
global.metal1='tube'
global.metal2='fixtures'
global.metal3='frame'
global.metal4='hydraulics'
global.metal5='machine'
global.bio0='cell'
global.bio1='phlegm'
global.bio2='tissue'
global.bio3='muscle'
global.bio4='organoid'
global.bio5='organism'
global.mist0='condensate'
global.mist1='concentrate'
global.mist2='extract'
global.mist3='spirit'
global.mist4='emanation'
global.mist5='essence'

global.AGGRESSION_SCORES = {}

global.AGGRESSION_ATTACK = 1
AGGRESSION_SCORES[AGGRESSION_ATTACK] = 1

global.AGGRESSION_HARASS = 2
AGGRESSION_SCORES[AGGRESSION_HARASS] = 5

global.AGGRESSION_STEAL = 3
AGGRESSION_SCORES[AGGRESSION_STEAL] = 5

global.AGGRESSION_RESERVE = 4
AGGRESSION_SCORES[AGGRESSION_RESERVE] = 10

global.AGGRESSION_CLAIM = 5
AGGRESSION_SCORES[AGGRESSION_CLAIM] = 10

global.AGGRESSION_INVADE = 6
AGGRESSION_SCORES[AGGRESSION_INVADE] = 50

global.AGGRESSION_BLOCK_UPGRADE = 7
AGGRESSION_SCORES[AGGRESSION_BLOCK_UPGRADE] = 100

global.AGGRESSION_TRIGGER_SAFEMODE = 8
AGGRESSION_SCORES[AGGRESSION_TRIGGER_SAFEMODE] = 500

global.AGGRESSION_RAZE = 9
AGGRESSION_SCORES[AGGRESSION_RAZE] = 1000

global.TERMINAL_MIN_SEND=1000
global.TERMINAL_MAX_SEND=50000