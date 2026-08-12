# FundsRoom Architecture

React dashboard -> Axios -> Express REST API -> authentication/authorization middleware -> Mongoose -> MongoDB.

Main entities: User, Customer, FollowUp, Product, StockMovement, Challan and embedded Challan items.

Role permissions: Admin manages everything; Sales manages customers and challans; Warehouse manages products and stock; Accounts has operational read access.

Challan confirmation validates every item's stock, decrements stock and creates OUT movement records in a MongoDB session transaction, then marks the challan Confirmed. If stock is insufficient, the transaction is aborted.

Use MongoDB Atlas/replica-set deployment for transaction support in production.
