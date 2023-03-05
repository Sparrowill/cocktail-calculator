# Cocktail Calculator User Guide #

## Installation ##
Download the correct binary for your OS from the latest release page.<br>
(.exe for Windows, .deb for Linux etc.)

Run the setup installer and ignore all the security warnings. To get rid of those involves signing my code, which costs $$$

That's it! There should be a shortcut to run the app on your Desktop (or equivalent, I'm devving on Windows)

# User Flow #
## Page 1 ##
This page is designed to take in as much or as little client data as you have available. Whether it's just on the phone taking an initial enquiry, or you want to generate a full event sheet and invoice for a job that's been booked in since last year.

All the fields are optional, you could just leave them all blank and it would still work. probably best not to though.

### A Description of each field, and what it does: ###

All fields are optional and have very little error checking (you can pretty much put whatever you want in and it'll either work or not...)
<br>
| Field                     | Description |
| --------------------------|-------------|
|Client Name                |Input the client's full name, this is then used in the created file names, the Event Sheet, and the Shopping List. <br><b>If left blank, John Smith is used.</b>|
| 1st Line Address          | Simple text field, used on the Event Sheet.|
| 2nd Line Address          | Simple text field, used on the Event Sheet.|
| City                      | Simple text field, used on the Event Sheet.|
| Postcode                  | Not case sensitive, used on the Event Sheet. <b> Will be converted to UPPER CASE </b>|
| Date of Event             | Must be a date. Is then used in the Event Sheet in the format yyyy-mm-dd.|
| Start Time                | Time input for the start of the client's event, used on the Event Sheet.|
| End Time                  | Time input for the end of the client's event, used on the Event Sheet.|
| Duration                  |  Number of hours the event runs for. Yes I could calculate this myself, but I prefer letting you define it.<br> This is then used to calculate invoice prices on the Event Sheet, and the amounts required in the Shopping List. <br> <b>Defaults to 1. </b>|
| Number of Guests         | The number of guests at the event.<br> This then used to calculate amounts required in the Shopping List. It's also used as the number of Hen Guests if 'Hen Do Masterclass' is checked.<br><b>Defaults to 1</b>|
| Nature of Event           | Simple text field, used on the Event Sheet.
|No. Flair Bartenders       | The number of flair bartenders booked by the client, then used to calculate invoice prices on the Event Sheet. <b> Defaults to 0</b>|
| No. Cocktail Bartenders   | The number of flair bartenders booked by the client, then used to calculate invoice prices on the Event Sheet. <b> Defaults to 0</b>|
| No. Mobile Bars            | The number of mobile bars booked by the client. then used to calcualte invoice prices on the Event Sheet. <br> <b>If this is 0, then 'Charge Glassware' has no effect. Defaults to 0.</b>|
| Hen Do Masterclass?       | <b>If checked </b>, this takes the number of guests and uses them to calculate the invoice pricing on the Event Sheet. <br><b>Does not affect No. Cocktail Bartenders, or No. Flair Bartenders.</b>|
| Charge Glassware?         | If checked, this applies the formula £1 per person + £20 to the invice on the Event Sheet. <br><b> Does not appear on the Event Sheet if no bars have been hired.</b>|
| Charge Ingredients?       | If checked, this takes the total ingredient cost from the Shopping List, adds on 20%, then adds it to the invoice on the Event Sheet.|
|Travel Cost (miles)        | This calculates mileage at £0.75 per mile. <br> <b>Defaults to 0</b>|
| Extra Cost (±£)           | Free number box to add or subtract cost as necessary. <b> Defaults to 0</b>|


## Page 2 ##

Here the cocktails for the event can be selected. They are generated from the recipes stored in cocktails.json.

<b>Due to space constraints on the Menu and Event Sheet, a maximum of 8 different cocktails can be selected for any one event.</b> <br>Come ask me if you want me to take that limit off or increase it. 

## Page 3 ##

The final step. All documents created are .pdf so are cross-platform (works on Windows, Mac, Linux). 

### Event Sheet/Invoice ###
A .pdf version of the spreadsheet. Takes all your inputs and creates something you can send to bar staff, and clients.

### Cocktail Menu ###
A branded list of all the cocktails, designed to be printd out by the customer. Any mocktail friendly drinks are indicated.

### Shopping List ###
This easily took the longest time of all three. Every ingredient from all the cocktails selected, combined and multiplied by the number of guests and the event length, combined with their standard sale quantities (700ml mosty) and prices (prices are on the low side).

### A Description of each button, and what it does: ###
| Button | Description|
| --- | --- |
|Generate All Documents | Produces 3 consecutive 'save' windows for the Event Sheet, the Cocktail Menu, and the Shopping List.|
| Generate Event Sheet/Invoice | Produces a 'save' window for the Event Sheet /Invoice|
| Generate Cocktail Menu | Produces a 'save' window for the Cocktail Menu. This is designed to go in a frame on a bar, or to be sent out to guests beforehand.|
| Generate Shopping List | Produces a 'save' window for a <b> Client Friendly </b> Shopping List. This is designed to be used when we aren't charging for ingredients, but works equally well if we're buying them ourselves.|
| Start Again|   Wipes all inputted data and loads a a fresh instance. of Cocktail Calculator, useful when you're inputting multiple clients|
# Menu #
The menu at the top of the main window allows you to access a copy of this user guide, as well as update various settings in the program. Costs and the maximum number of cocktails can be updated at ANY time throughout the process. Even after putting all details in!

# Dev Contact #

For any bugs or feature requests, either raise them as issues on Github, or if you've got my mobile number/email address, use it.

© Will Sparrow 2023