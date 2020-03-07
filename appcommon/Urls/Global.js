
class Global {

    static PROD_VAR = true;

    static BASE_PATH = Global.PROD_VAR ? "https://www.bringmyfood.in" : 'http://192.168.31.60';

    static VERSION_CHECK_URL = '/data/reactapp/userapp/get-current-version-number.php';

    static FETCH_KITCHEN_STATUS_URL = '/data/angularweb/fetch-kitchen-status.php';

    static USER_LAST_ORDER_URL = '/data/angularweb/check-last-order-of-user.php';

    static CHECK_SERVICE_URL = '/data/angularweb/check-pincode-service.php';

    static FETCH_ALL_CATEGORIES_URL = '/data/angularweb/fetch-all-categories.php';

    static FETCH_DELIVERY_CHARGES_URL = '/data/reactapp/userapp/get-delivery-charge-of-order.php';

    static FETCH_CATEGORY_PRODUCT_URL = '/data/angularweb/fetch-category-products.php';

    static FETCH_RECOMMENDED_PRODUCT_URL = '/data/angularweb/fetch-recommended-products.php';

    static AUTHENTICATE_USER_URL = '/data/angularweb/nextlogin.php';

    static CHECK_USER_PHONE_URL = '/data/reactapp/userapp/check-user-by-phone-number.php';

    static RATE_ORDER_URL = '/data/reactapp/userapp/rate-order.php';

    static FETCH_USER_DATA_URL = '/data/reactapp/userapp/fetch-user-wallet-money.php';

    static FETCH_DASHBOARD_OFFERS_URL = '/data/angularweb/fetch-dashboard-offers.php';

    static FETCH_TRENDING_CATEGORIES_URL = '/data/reactapp/userapp/fetchtrendingcategoryinorder.php';

    static FETCH_TOPS_SELLING_PRODUCST = '/data/angularweb/fetch-trending-products-in-order.php';

    static FETCH_NEW_ARRIVAL_PRODUCTS = '/data/angularweb/fetch-newly-added-products.php';

    static FETCH_ON_OFFER_PRODUCTS = '/data/angularweb/fetch-on-offer-products.php';

    static FETCH_COMBO_MEALS_FOR_YOU_PRODUCTS = '/data/angularweb/fetch-combo-products.php';

    static FETCH_TRENDING_PRODUCTS_URL = '/data/angularweb/fetch-trending-products-in-order.php';

    static FETCH_TAX_STATUS_URL = '/data/reactapp/userapp/get-tax-status.php';

    static GET_CART_PRODUCT_AVAILABILITY_URL = '/data/reactapp/userapp/check-cart-products-availability.php';

    static FETCH_CHEF_LIST_URL = '/data/angularweb/fetch-chef-products.php';

    static FETCH_CHEF_DISHES_URL = '/data/angularweb/fetch-chef-dishes.php';

    static FETCH_NEW_CHEFS_URL = '/data/angularweb/fetch-newly-added-chefs.php';

    static FETCH_BEST_CHEFS_URL = '/data/angularweb/fetch-superchefs.php';

    static FETCH_CHEF_INFO_URL = '/data/angularweb/fetch-chef-info.php';

    static FETCH_CHEF_HIGHLIGHTS_INFO_URL = '/data/angularweb/fetch-chef-highlights-info.php';

    static FETCH_CHECKOUT_INFO = '/data/angularweb/fetch-checkout-info.php';

    static CHECK_CART_AVAILABILITY_URL = '/data/angularweb/check-cart-products-availability.php';

    static SAVE_USER_ADDRESS_URL = '/data/angularweb/add-user-address.php';

    static FETCH_USER_SAVED_ADDRESS_URL = '/data/angularweb/fetch-user-saved-addresses.php';

    static FETCH_COUPONS_URL = '/data/angularweb/fetch-offers.php';

    static CHECK_SERVICES_BY_LOCALITY_URL = '/data/angularweb/check-services-availability-by-locality.php';

    static FETCH_ORDER_SUMMARY_URL = "/data/angularweb/fetch-order-summary.php";

    static CANCEL_ORDER_URL = "/data/angularweb/cancel-order.php";

    static CALC_PAY_AMOUNT_URL = "/data/angularweb/calculate-payable-amount.php";

    static CREATE_ORDER_URL = "/data/angularweb/create-order.php";

    static FORGOT_PASSWORD_URL = "/data/reactapp/userapp/forgot-password.php";

    static RESEND_SIGNUP_OTP_URL = "/data/angularweb/resend-signup-otp.php";

    static RESEND_RESET_OTP_URL = "/data/angularweb/resend-reset-pass-otp.php";

    static RESET_USER_PASS_URL = "/data/reactapp/userapp/resetuserpassword.php";

    static GEN_SIGNUP_OTP_URL = "/data/reactapp/userapp/generate-signup-otp.php";

    static VERIFY_SIGNUP_OTP_URL = "/data/angularweb/verify-signup-otp.php";

    static FETCH_QUICKPICK_PRODUCTS_URL = "/data/angularweb/fetch-quickpick-products.php";

    static FETCH_ORDERS_URL = "/data/angularweb/fetch-user-orders.php";

    static REPEAT_ORDER_URL = "/data/angularweb/repeat-order.php";

    static TRACK_ORDER_URL = "/data/angularweb/track-order.php";

    static SET_USER_DELIVERY_TIMESLOT = "/data/angularweb/set-user-delivery-timeslot.php";

    static FIND_PRODUCTS = "/data/angularweb/find-products.php";

    static FETCH_ONGOING_ORDERS_URL = "/data/angularweb/get-ongoing-orders.php";

    static FETCH_PUSH_CATEGORIES_ON_SEARCH_URL = '/data/reactapp/userapp/push-categories-on-search.php';

    static FETCH_PUSH_CHEFS_ON_SEARCH_URL = '/data/reactapp/userapp/push-chefs-on-search.php';

    static APP_EXIT_REASON = '/data/reactapp/userapp/app-exit-reason.php';

    static CHEF_REGISTRATION_URL = '/data/reactapp/userapp/chef-registration.php';

    static FETCH_SAVED_ADDRESS_URL = "/data/angularweb/fetch-user-saved-addresses.php";

    static SAVE_PROFILE_CHANGES_URL = "/data/reactapp/userapp/save-profile-changes.php";

    static SUBMIT_CHEF_REVIEW_URL = "/data/angularweb/submit-chef-review.php";

    // static FETCH_TENDING_CATEGORY_IN_ORDER_URL = "/data/angularweb/fetch-trending-category-in-order.php"

    static FETCH_NOTIFICATION_URL = "/data/reactapp/userapp/fetch-notifications.php"
}

export default Global;

