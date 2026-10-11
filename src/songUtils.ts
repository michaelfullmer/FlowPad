/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Expanded rhyme dictionary with 60+ common word endings
const RHYME_GROUPS: Record<string, string[]> = {
  'ack': ['back', 'black', 'track', 'pack', 'sack', 'lack', 'shack', 'stack', 'attack'],
  'ake': ['make', 'take', 'shake', 'lake', 'fake', 'break', 'wake', 'snake', 'cake'],
  'ale': ['sale', 'tale', 'male', 'pale', 'whale', 'scale', 'mail', 'fail', 'rail'],
  'all': ['all', 'ball', 'call', 'fall', 'tall', 'wall', 'small', 'hall', 'stall'],
  'ame': ['name', 'same', 'game', 'fame', 'tame', 'flame', 'shame', 'blame', 'frame'],
  'an': ['can', 'man', 'plan', 'ran', 'fan', 'pan', 'than', 'began', 'span'],
  'ane': ['plane', 'rain', 'pain', 'main', 'brain', 'chain', 'drain', 'grain', 'lane'],
  'ang': ['sang', 'bang', 'hang', 'rang', 'gang', 'slang', 'twang'],
  'ank': ['bank', 'thank', 'rank', 'sank', 'tank', 'blank', 'drank', 'frank'],
  'ap': ['cap', 'map', 'trap', 'lap', 'snap', 'clap', 'wrap', 'tap', 'gap'],
  'ash': ['cash', 'dash', 'flash', 'crash', 'smash', 'trash', 'bash', 'rash'],
  'ate': ['date', 'late', 'gate', 'fate', 'state', 'plate', 'wait', 'great', 'eight'],
  'aw': ['saw', 'law', 'raw', 'draw', 'claw', 'jaw', 'straw', 'flaw'],
  'eak': ['speak', 'weak', 'leak', 'peak', 'seek', 'cheek', 'streak', 'break'],
  'eal': ['real', 'deal', 'feel', 'heal', 'steal', 'meal', 'seal', 'wheel'],
  'ean': ['mean', 'clean', 'lean', 'green', 'seen', 'been', 'queen', 'screen'],
  'ear': ['near', 'dear', 'fear', 'hear', 'clear', 'year', 'steer', 'cheer'],
  'eat': ['eat', 'beat', 'heat', 'meat', 'seat', 'feet', 'sweet', 'treat', 'sheet'],
  'eed': ['need', 'feed', 'seed', 'speed', 'bleed', 'greed', 'reed', 'weed'],
  'eek': ['seek', 'week', 'peek', 'cheek', 'meek', 'sleek', 'tweak'],
  'eel': ['feel', 'steel', 'wheel', 'peel', 'heel', 'reel', 'kneel'],
  'een': ['seen', 'green', 'queen', 'screen', 'between', 'fourteen', 'teen'],
  'eep': ['keep', 'deep', 'sleep', 'sheep', 'steep', 'sweep', 'creep', 'beep'],
  'eer': ['beer', 'deer', 'steer', 'cheer', 'peer', 'sneer', 'queer'],
  'eet': ['feet', 'meet', 'street', 'sweet', 'sheet', 'greet', 'fleet'],
  'ell': ['tell', 'well', 'sell', 'hell', 'shell', 'spell', 'smell', 'bell', 'fell'],
  'end': ['end', 'send', 'bend', 'mend', 'friend', 'spend', 'blend', 'trend'],
  'ent': ['sent', 'went', 'bent', 'rent', 'tent', 'spent', 'event', 'prevent'],
  'ess': ['less', 'mess', 'dress', 'press', 'guess', 'bless', 'confess', 'address'],
  'ice': ['nice', 'rice', 'mice', 'price', 'twice', 'slice', 'advice', 'device'],
  'ick': ['kick', 'pick', 'sick', 'thick', 'stick', 'quick', 'trick', 'click'],
  'ide': ['side', 'ride', 'wide', 'hide', 'guide', 'inside', 'pride', 'slide'],
  'ife': ['life', 'wife', 'knife', 'strife', 'rife'],
  'ike': ['like', 'bike', 'hike', 'spike', 'strike', 'mike', 'alike'],
  'ile': ['smile', 'while', 'file', 'mile', 'pile', 'style', 'trial', 'dial'],
  'ime': ['time', 'prime', 'crime', 'climb', 'rhyme', 'chime', 'slime'],
  'ind': ['find', 'kind', 'mind', 'blind', 'behind', 'wind', 'grind'],
  'ing': ['sing', 'ring', 'king', 'wing', 'thing', 'bring', 'spring', 'string'],
  'ink': ['think', 'pink', 'sink', 'drink', 'link', 'blink', 'shrink', 'wink'],
  'ip': ['ship', 'trip', 'lip', 'clip', 'slip', 'grip', 'drip', 'hip', 'skip'],
  'ire': ['fire', 'wire', 'hire', 'tire', 'desire', 'inspire', 'entire', 'choir'],
  'ock': ['rock', 'lock', 'clock', 'block', 'shock', 'stock', 'knock', 'dock'],
  'oke': ['smoke', 'broke', 'woke', 'joke', 'spoke', 'choke', 'stroke', 'folk'],
  'old': ['old', 'gold', 'cold', 'hold', 'told', 'sold', 'bold', 'behold'],
  'ong': ['song', 'long', 'strong', 'wrong', 'along', 'belong', 'among'],
  'ook': ['look', 'book', 'took', 'cook', 'hook', 'shook', 'brook'],
  'ool': ['cool', 'pool', 'school', 'tool', 'fool', 'rule', 'cruel'],
  'oom': ['room', 'boom', 'doom', 'gloom', 'bloom', 'zoom', 'groom'],
  'oon': ['soon', 'moon', 'noon', 'spoon', 'balloon', 'cartoon', 'june'],
  'oop': ['loop', 'hoop', 'scoop', 'troop', 'droop', 'group', 'soup'],
  'oot': ['foot', 'root', 'boot', 'shoot', 'loot', 'suit', 'fruit'],
  'op': ['top', 'stop', 'shop', 'drop', 'crop', 'hop', 'pop', 'cop'],
  'ope': ['hope', 'rope', 'scope', 'slope', 'dope', 'pope', 'envelope'],
  'ore': ['more', 'door', 'floor', 'shore', 'score', 'before', 'explore', 'store'],
  'orn': ['born', 'corn', 'horn', 'torn', 'worn', 'morn', 'scorn'],
  'ose': ['close', 'rose', 'nose', 'those', 'chose', 'suppose', 'expose'],
  'oss': ['loss', 'boss', 'cross', 'toss', 'gloss', 'moss', 'across'],
  'uck': ['luck', 'truck', 'duck', 'stuck', 'buck', 'suck', 'cluck'],
  'ug': ['hug', 'bug', 'rug', 'tug', 'plug', 'drug', 'slug', 'mug'],
  'ump': ['jump', 'bump', 'pump', 'lump', 'dump', 'stump', 'clump'],
  'unk': ['drunk', 'trunk', 'junk', 'sunk', 'bunk', 'chunk', 'skunk'],
};

export function getRhymes(word: string): string[] {
  if (!word) return [];
  const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');
  
  // Try to find a matching ending (longer endings first for better matching)
  const endings = Object.keys(RHYME_GROUPS).sort((a, b) => b.length - a.length);
  
  for (const ending of endings) {
    if (lowerWord.endsWith(ending)) {
      return RHYME_GROUPS[ending].filter(r => r !== lowerWord);
    }
  }
  
  return [];
}

/**
 * Improved syllable counter
 * Counts syllables for a whole line of text
 */
export function countSyllables(text: string): number {
  if (!text || text.trim() === '') return 0;
  
  const words = text.toLowerCase().split(/\s+/);
  let total = 0;
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (!cleanWord) continue;
    
    if (cleanWord.length <= 3) {
      total += 1;
      continue;
    }
    
    // Syllable counting logic
    let count = 0;
    const syllables = cleanWord
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '') // Remove silent e, es, ed
      .replace(/^y/, '') // Initial y is a consonant
      .match(/[aeiouy]{1,2}/g); // Count vowel groups
      
    count = syllables ? syllables.length : 1;
    total += count;
  }
  
  return total;
}
