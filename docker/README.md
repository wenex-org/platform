# Docker

## STUN/TURN Server

Create the `coturn` database schema manually from `./config/coturn-schema.sql` file.

```sh
# Run this command inside the coturn container - https://127.0.0.1:8080
turnadmin -A -M "host=127.0.0.1 dbname=coturn user=coturn password=admin port=3306 connect_timeout=10 read_timeout=10" -u coturn -p admin -r wenex.org
```
