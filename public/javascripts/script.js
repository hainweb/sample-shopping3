  
   function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cartCount').html();
                count = parseInt(count) + 1;
                $('#cartCount').html(count);
            } else {
                console.error('Failed to add to cart: ', response);
            }
        },

        error: (xhr, status, error) => {
            console.error('AJAX request failed: ', status, error);
        }
    });
}

        const cartButtons = document.querySelectorAll('.cart-button');
    
        cartButtons.forEach(button => {
            button.addEventListener('click', cartClick);
        });
    
        function cartClick() {
            let button = this;
            button.classList.add('clicked');
    
            // Reset button position after 3 seconds
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 3000); // 3000 milliseconds = 3 seconds
        }

        document.querySelectorAll('.button').forEach(button => button.addEventListener('click', e => {
            if (!button.classList.contains('delete')) {
                button.classList.add('delete');
                setTimeout(() => button.classList.remove('delete'), 3200);
            }
            e.preventDefault();
        }));
 