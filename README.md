
Reservation System for Restaurant. 

Two user groups, Customer (unauth) and Admin (Auth)
Create reservations via Reservation page - Select date, number of people, and restrictions - i.e. Baby chair.
Outputs available tables at that given date. Accepting and filling in details provides reservation ID, both on page and via ClickSend SMS
Reservation ID is stored in MongoDB, can be used to retrieve reservation for modifications

Admin panel can update tables and reservations. Tables are a separate object which reservations rely. Updating a table updates any reservations on the day of maintainance etc.
Updating Reservations notifies User/Customer of updates to their reservations.
