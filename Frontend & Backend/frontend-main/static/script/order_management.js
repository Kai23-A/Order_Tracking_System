function changeOrder(button) {
    // Logic to change the order status
    const row = button.parentElement.parentElement; // Get the row
    const statusSelect = row.querySelector('select'); // Get the status dropdown
    const selectedStatus = statusSelect.value; // Get the selected value
    alert('Order status changed to: ' + selectedStatus);
    // Add your logic to update the order status in the database
}

function deleteOrder(button, orderId) {
    // Find the row that contains the delete button
    var row = button.closest('tr');
    
    // Optionally, add a confirmation step before deleting
    if (confirm("Are you sure you want to remove this order from the view?")) {
        // Temporarily remove the row from the table (without removing from the database)
        row.style.display = 'none';

        // Send an AJAX request to mark the order as removed in the database
        fetch(`/remove_order/${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Order marked as removed.");
            } else {
                alert("Failed to mark order as removed.");
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function editOrder(orderId) {
    // Show input fields and hide span text
    document.getElementById("input_customer_name_" + orderId).style.display = 'block';
    document.getElementById("customer_name_" + orderId).style.display = 'none';

    document.getElementById("input_contact_number_" + orderId).style.display = 'block';
    document.getElementById("contact_number_" + orderId).style.display = 'none';

    document.getElementById("input_address_" + orderId).style.display = 'block';
    document.getElementById("address_" + orderId).style.display = 'none';

    document.getElementById("input_pickup_place_" + orderId).style.display = 'block';
    document.getElementById("pickup_place_" + orderId).style.display = 'none';

    document.getElementById("input_pickup_date_" + orderId).style.display = 'block';
    document.getElementById("pickup_date_" + orderId).style.display = 'none';

    document.getElementById("input_delicacy_" + orderId).style.display = 'block';
    document.getElementById("delicacy_" + orderId).style.display = 'none';

    document.getElementById("input_quantity_" + orderId).style.display = 'block';
    document.getElementById("quantity_" + orderId).style.display = 'none';

    document.getElementById("input_container_" + orderId).style.display = 'block';
    document.getElementById("container_" + orderId).style.display = 'none';

    document.getElementById("input_special_request_" + orderId).style.display = 'block';
    document.getElementById("special_request_" + orderId).style.display = 'none';

    document.getElementById("input_status_" + orderId).style.display = 'block';
    document.getElementById("status_" + orderId).style.display = 'none';

    // Show Save and Cancel buttons, hide Change button
    document.getElementById("change_button_" + orderId).style.display = 'none';
    document.getElementById("save_button_" + orderId).style.display = 'inline-block';
    document.getElementById("cancel_button_" + orderId).style.display = 'inline-block';
}

function cancelEdit(orderId) {
    // Revert back to displaying the span values and hide the input fields
    document.getElementById("input_customer_name_" + orderId).style.display = 'none';
    document.getElementById("customer_name_" + orderId).style.display = 'inline';

    document.getElementById("input_contact_number_" + orderId).style.display = 'none';
    document.getElementById("contact_number_" + orderId).style.display = 'inline';

    document.getElementById("input_address_" + orderId).style.display = 'none';
    document.getElementById("address_" + orderId).style.display = 'inline';

    document.getElementById("input_pickup_place_" + orderId).style.display = 'none';
    document.getElementById("pickup_place_" + orderId).style.display = 'inline';

    document.getElementById("input_pickup_date_" + orderId).style.display = 'none';
    document.getElementById("pickup_date_" + orderId).style.display = 'inline';

    document.getElementById("input_delicacy_" + orderId).style.display = 'none';
    document.getElementById("delicacy_" + orderId).style.display = 'inline';

    document.getElementById("input_quantity_" + orderId).style.display = 'none';
    document.getElementById("quantity_" + orderId).style.display = 'inline';

    document.getElementById("input_container_" + orderId).style.display = 'none';
    document.getElementById("container_" + orderId).style.display = 'inline';

    document.getElementById("input_special_request_" + orderId).style.display = 'none';
    document.getElementById("special_request_" + orderId).style.display = 'inline';

    document.getElementById("input_status_" + orderId).style.display = 'none';
    document.getElementById("status_" + orderId).style.display = 'inline';

    // Hide Save and Cancel buttons, show Change button again
    document.getElementById("save_" + orderId).style.display = 'none';
    document.getElementById("cancel_" + orderId).style.display = 'none';
    document.querySelector(`button[onclick="editOrder(${orderId})"]`).style.display = 'inline-block';
}

function saveOrder(orderId) {
    // Gather the updated data
    let formData = {
        customer_name: document.getElementById("input_customer_name_" + orderId).value,
        contact_number: document.getElementById("input_contact_number_" + orderId).value,
        address: document.getElementById("input_address_" + orderId).value,
        pickup_place: document.getElementById("input_pickup_place_" + orderId).value,
        pickup_date: document.getElementById("input_pickup_date_" + orderId).value,
        delicacy: document.getElementById("input_delicacy_" + orderId).value,
        quantity: document.getElementById("input_quantity_" + orderId).value,
        container: document.getElementById("input_container_" + orderId).value,
        special_request: document.getElementById("input_special_request_" + orderId).value,
        status: document.getElementById("input_status_" + orderId).value,
    };

    // Send updated data to the server
    fetch(`/update_order/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Order updated successfully!');
            updateUI(orderId, formData);  // Update the UI with new data
        } else {
            alert('Failed to update order.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the order.');
    });
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        fetch('/delete_order/' + orderId, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                document.getElementById("order_" + orderId).remove(); // Remove the row from the table
            } else {
                alert('Failed to delete order.');
            }
        });
    }
}

function saveOrder(orderId) {
    // Gather the updated data from the input fields
    let formData = {
        customer_name: document.getElementById("input_customer_name_" + orderId).value,
        contact_number: document.getElementById("input_contact_number_" + orderId).value,
        address: document.getElementById("input_address_" + orderId).value,
        pickup_place: document.getElementById("input_pickup_place_" + orderId).value,
        pickup_date: document.getElementById("input_pickup_date_" + orderId).value,
        delicacy: document.getElementById("input_delicacy_" + orderId).value,
        quantity: document.getElementById("input_quantity_" + orderId).value,
        container: document.getElementById("input_container_" + orderId).value,
        special_request: document.getElementById("input_special_request_" + orderId).value,
        status: document.getElementById("input_status_" + orderId).value,
    };

    // Send the updated order data to the server using an AJAX POST request
    fetch('/update_order/' + orderId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If successful, update the UI and hide input fields
            updateUI(orderId, data.order);
            alert('Order updated successfully!');
        } else {
            alert('Failed to update order.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the order.');
    });
}

function updateUI(orderId, updatedOrder) {
    // Update the displayed values with the new data
    document.getElementById("customer_name_" + orderId).innerText = updatedOrder.customer_name;
    document.getElementById("contact_number_" + orderId).innerText = updatedOrder.contact_number;
    document.getElementById("address_" + orderId).innerText = updatedOrder.address;
    document.getElementById("pickup_place_" + orderId).innerText = updatedOrder.pickup_place;
    document.getElementById("pickup_date_" + orderId).innerText = updatedOrder.pickup_date;
    document.getElementById("delicacy_" + orderId).innerText = updatedOrder.delicacy;
    document.getElementById("quantity_" + orderId).innerText = updatedOrder.quantity;
    document.getElementById("container_" + orderId).innerText = updatedOrder.container;
    document.getElementById("special_request_" + orderId).innerText = updatedOrder.special_request;
    document.getElementById("status_" + orderId).innerText = updatedOrder.status;

    // Hide input fields and show the updated values
    document.getElementById("input_customer_name_" + orderId).style.display = 'none';
    document.getElementById("customer_name_" + orderId).style.display = 'inline';

    document.getElementById("input_contact_number_" + orderId).style.display = 'none';
    document.getElementById("contact_number_" + orderId).style.display = 'inline';

    document.getElementById("input_address_" + orderId).style.display = 'none';
    document.getElementById("address_" + orderId).style.display = 'inline';

    document.getElementById("input_pickup_place_" + orderId).style.display = 'none';
    document.getElementById("pickup_place_" + orderId).style.display = 'inline';

    document.getElementById("input_pickup_date_" + orderId).style.display = 'none';
    document.getElementById("pickup_date_" + orderId).style.display = 'inline';

    document.getElementById("input_delicacy_" + orderId).style.display = 'none';
    document.getElementById("delicacy_" + orderId).style.display = 'inline';

    document.getElementById("input_quantity_" + orderId).style.display = 'none';
    document.getElementById("quantity_" + orderId).style.display = 'inline';

    document.getElementById("input_container_" + orderId).style.display = 'none';
    document.getElementById("container_" + orderId).style.display = 'inline';

    document.getElementById("input_special_request_" + orderId).style.display = 'none';
    document.getElementById("special_request_" + orderId).style.display = 'inline';

    document.getElementById("input_status_" + orderId).style.display = 'none';
    document.getElementById("status_" + orderId).style.display = 'inline';

    // Hide Save and Cancel buttons, show Change button
    document.getElementById("save_" + orderId).style.display = 'none';
    document.getElementById("cancel_" + orderId).style.display = 'none';
    document.querySelector(`button[onclick="editOrder(${orderId})"]`).style.display = 'inline-block';
}
