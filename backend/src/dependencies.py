import os
# import sys

from db import MockDBConnection, MongoDBConnection

# try:
#     with open("/run/secrets/backend_mongodb_connection_uri", "r", encoding="utf8") as mongo_secret:
#         MONGODB_CONNECTION_URI = mongo_secret.readline().strip()
# except IOError:
#     print("WARNING: Cannot read 'backend_mongodb_connection_uri'")
#     sys.exit(1)

# For testing
MONGODB_CONNECTION_URI = os.getenv("MONGODB_CONNECTION_URI")

if MONGODB_CONNECTION_URI == "!null":
    print("WARNING: 'backend_mongodb_connection_uri' not set, starting MockDB")
    DBConnection = MockDBConnection()
else:
    DBConnection = MongoDBConnection(MONGODB_CONNECTION_URI)
