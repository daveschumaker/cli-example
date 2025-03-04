// Key codes for direct comparison (in raw mode)
export const BACKSPACE = '\x7F'; // ASCII DEL (127)
export const DELETE = '\x1B[3~'; // Escape sequence for delete key
export const CTRL_C = '\x03';
export const CTRL_U = '\x15';
export const CTRL_K = '\x0B';
export const CTRL_H = '\x08'; // Often also used for backspace

// Arrow keys and navigation
export const ARROW_LEFT = '\x1B[D';
export const ARROW_RIGHT = '\x1B[C';
export const HOME = '\x1B[H';
export const END = '\x1B[F';
export const CTRL_A = '\x01'; // Alternative home
export const CTRL_E = '\x05'; // Alternative end
