  
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
          // Search functionality
          document.getElementById('search').addEventListener('keyup', function() {
            var searchValue = this.value.toLowerCase();
            var productItems = document.getElementsByClassName('product-item');
            var noProductsMessage = document.getElementById('no-products');
            var hasVisibleProducts = false;

            Array.from(productItems).forEach(function(item) {
                var name = item.getAttribute('data-name').toLowerCase();
                var category = item.getAttribute('data-category').toLowerCase();

                if (name.includes(searchValue) || category.includes(searchValue)) {
                    item.style.display = '';
                    hasVisibleProducts = true;
                } else {
                    item.style.display = 'none';
                }
            });

            // Show or hide the "No products found" message
            if (hasVisibleProducts) {
                noProductsMessage.style.display = 'none';
            } else {
                noProductsMessage.style.display = 'block';
            }
        });
        $(document).ready(function() {
            var canDownload = true; // Initialize your variable as needed
            var money = 100; // Example initial balance
        
            $('.buy').on('click', function() {
                var button = $(this);
        
                // Check if button is already in 'success' state
                if (button.hasClass('success')) {
                    var productId = button.data('id'); // Get product ID from data attribute
                    console.log("Product ID:", productId);
                    window.location.href = `/your-hbs-page/${productId}`; // Redirect to the HBS page
                } else {
                    // Handle button click if not in 'success' state
                    if (canDownload) {
                        button.addClass('loading').find('span, small').hide();
                        setTimeout(function() {
                            button.removeClass('loading').addClass('processing');
                            canDownload = false;
                            setTimeout(function() {
                                button.removeClass('processing').addClass('success').find('.fa-check').fadeIn(100);
                                setTimeout(function() {
                                    money -= 39.99;
                                    $('.balance span').text(money);
                                    $('.download').removeClass('active'); // Remove tracking feature
                                    canDownload = true;
        
                                    // Check if success class was applied
                                    if (button.hasClass('success')) {
                                        var productId = button.data('id');
                                        console.log("Product ID after success:", productId);
                                        window.location.href = `/buy-now/${productId}`;
                                    }
                                }, 1000);
                            }, 400);
                        }, 300);
                    }
                }
            });
        });
        
        