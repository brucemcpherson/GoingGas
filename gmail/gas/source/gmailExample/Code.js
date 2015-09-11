// get emails and find those mentioning a flight - this is triggered task running now and again

function trigger() {

  // open the sheet and get the carrier data
  var carrierData = new SheetOb().open(Settings.LOOKUP.ID, Settings.LOOKUP.NAME).getData();

  // get all the potential threads
  var threads = Threads.get();
  
  // match for any likely flights 
  var mobs = Match.messages(threads, carrierData);
  
  // organize matches to prrioritize
  var organized = Match.organize(mobs);
  
  // generate emails and mark as processed
  Threads.send (organized);

   
}
