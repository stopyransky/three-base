
export default function DebugLogger() {
  let limit = 1;
  let count = 0;
  return {
    log(...wat) {
      if(count < limit) {
        console.log(...wat);
        count++;
      }
    }
  }
    
  
}