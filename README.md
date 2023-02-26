# README #
## Cocktail Calculator User Guide ##

### Installation ###
Download the correct binary for your OS from the latest release page.<br>
(.exe for Windows, .deb for Linux etc.)

Run the setup installer and ignore all the security warnings. To get rid of those involves signing my code, which costs $$$

That's it! There should be a shortcut to run the app on your Desktop (or equivalent, I'm devving on Windows)

### Page 1 ###
A Description of each field, and what it does:

(All fields are optional and have very little error checking.)

- Client Name - Input the client's full name, this is then used in the created file names, the event sheet, and the shopping list. <br>If left blank, John Smith is used.

- 1st Line Address - Relatively self explanatory, remains blank if not provided

- 2nd Line Address - Same as above

- City - Same as above

- Postcode - Not case sensitive. What you put in is what you get out.

- Date of Event - Must be a date. Is then used in the Event Sheet in the format yyyy-mm-dd

- Start Time - Time input for the start of the client's event

- End Time - Time input for the end of the client's event

- Duration - Number of hours the event runs for. Yes I could calculate this myself, but I prefer letting you define it.<br>
Is then used to calculate invoice prices, and the amounts required in the shopping list. <br> If left blank, defaults to 1.

- Number of Guests - The number of guests at the event.<br>
Is then used to calculate amounts required in the shopping list. Is also used as the number of Hen Guests if 'Hen Do Masterclass' is checked.<br>
If left blank, defaults to 1

- Nature of Event - Simple text field, is then used on the Event Sheet.

- No. Flair Bartenders - The number of flair bartenders booked by the client. Is then used to calculate invoice.

- No. Cocktail Bartenders - The number of bartenders booked by the client. Is then used to calculate invoice.

- No. Mobile Bars - The number of mobile bars booked by the client. Is then used to calcualte invoice. <br> <b>If this is 0, then 'Charge Glassware' has no effect.</b>

- Hen Do Masterclass? - If checked, this takes the number of guests and uses them to calculate the invoice. <br><b>Does not take into account No. Cocktail Bartenders, or No. Flair Bartenders.</b>

- Charge Glassware? - If checked, this applies the formula £1 per person + £20. <br><b> Does not appear on the Event Sheet if no bars have been hired.</b>

- Charge Ingredients? - If checked, this takes the total ingredient cost from the shopping list, adds on 20%, then adds it to the Event Sheet.

- Travel Cost (miles) - This calculates mileage at £0.75 per mile. Defaults to 0

- Extra Cost (±£) - Free number box to add or subtract cost as necessary.

### Page 2 ###

Here the cocktails for the event can be selected. They are generated from the recipes stored in cocktails.json.

<b>Due to space constraints on the menu and event sheet, a maximum of 8 cocktails can be selected for any event.</b> <br>Come ask me if you want me to take that limit off. Formatting will die if we do.

### Page 3 ###

Click various buttons to do various things. 

- Generate All Documents - Produces 3 consecutive 'save' windows for the Event Sheet, the Cocktail Menu, and the Shopping List.

- The next three buttons do those things individually.

- Start Again - Wipes all inputted data and loads a a fresh instance.