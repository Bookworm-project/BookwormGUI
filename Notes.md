If this error occurs, MySQLdb._exceptions.OperationalError: (1045, "Access denied for user 'bookworm'@'localhost' (using password: NO)"), run the following commands.
-------------

mysql -u root -p

create user bookworm@localhost;

quit

mysql -u bookworm -p;

grant all privileges on *.* to bookworm@localhost;


