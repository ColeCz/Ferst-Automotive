# This file is not needed to run the application. It is a script used to generate the init sql script that adds all the transactions (purchase or sale)

import csv

# Initialize transaction ID
trans_id = 1

# Open the TSV file
with open('vehicles.tsv', 'r', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        # Extract data
        VIN = row['VIN']
        condition = row['condition']
        purchase_date = row['purchase_date']
        purchase_price = row['price']
        purchased_from_customer = row['purchased_from_customer']
        purchase_clerk = row['purchase_clerk']
        sale_date = row['sale_date']
        sold_to_customer = row['sold_to_customer']
        salesperson = row['salesperson']

        # Check if purchase_date is present
        if purchase_date.strip():

            # Insert into Transaction table for purchase
            print(f"INSERT INTO Transaction (trans_date, trans_price, customer, vehicle_vin) "
                  f"VALUES ('{purchase_date}', {purchase_price}, "
                  f"(SELECT customer_id FROM Individual WHERE ssn = '{purchased_from_customer}' "
                  f"UNION SELECT customer_id FROM Business WHERE tin = '{purchased_from_customer}'), "
                  f"'{VIN}');")

            # Insert into Purchase table
            print(f"INSERT INTO Purchase (transactions, clerk, condition) "
                  f"VALUES ({trans_id}, '{purchase_clerk}', '{condition}');")

            trans_id += 1  # Increment transaction ID

        # Check if sale_date is present
        if sale_date.strip():

            # Insert into Transaction table for sale
            print(f"INSERT INTO Transaction (trans_date, trans_price, customer, vehicle_vin) "
                  f"VALUES ('{sale_date}', "
                  f"{purchase_price} * 1.25 + 1.10 * (SELECT COALESCE(SUM(unit_price * quantity), 0) FROM part WHERE vehicle_vin = '{VIN}'), "
                  f"(SELECT customer_id FROM Individual WHERE ssn = '{sold_to_customer}' "
                  f"UNION SELECT customer_id FROM Business WHERE tin = '{sold_to_customer}'), "
                  f"'{VIN}');")

            # Insert into Sale table
            print(f"INSERT INTO Sale (transactions, salesperson) "
                  f"VALUES ({trans_id}, '{salesperson}');")

            trans_id += 1  # Increment transaction ID

