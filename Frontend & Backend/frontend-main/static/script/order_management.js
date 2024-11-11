function changeOrder(button) { 
    const row = button.parentElement.parentElement;
    const statusSelect = row.querySelector('select');
    const selectedStatus = statusSelect.value;
    alert('Order status changed to: ' + selectedStatus);
    // Add logic here to update the order status in the database if needed
}

function deleteOrder(button, orderId) {
    if (confirm("Are you sure you want to remove this order from the view?")) {
        // Temporarily remove the row from the table (without removing from the database)
        button.closest('tr').style.display = 'none';

        // Send an AJAX request to mark the order as removed in the database
        fetch(`/remove_order/${orderId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server (remove order):', data); // Debugging
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

    document.getElementById("change_button_" + orderId).style.display = 'none';
    document.getElementById("save_button_" + orderId).style.display = 'inline-block';
    document.getElementById("cancel_button_" + orderId).style.display = 'inline-block';
}

function cancelEdit(orderId) {
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

    document.getElementById("save_button_" + orderId).style.display = 'none';
    document.getElementById("cancel_button_" + orderId).style.display = 'none';
    document.getElementById("change_button_" + orderId).style.display = 'inline-block';
}

function saveOrder(orderId) {
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

    console.log('Saving order with data:', formData); // Debugging

    fetch(`/update_order/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from server (update order):', data); // Debugging
        if (data.success) {
            alert('Order updated successfully!');
            updateUI(orderId, formData);
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

    document.getElementById("save_button_" + orderId).style.display = 'none';
    document.getElementById("cancel_button_" + orderId).style.display = 'none';
    document.getElementById("change_button_" + orderId).style.display = 'inline-block';
}
