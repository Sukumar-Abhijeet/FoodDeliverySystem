package in.bringmyfood;

import android.app.Application;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.ReactApplication;
import io.invertase.firebase.RNFirebasePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.oblador.shimmer.RNShimmerPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.imagepicker.ImagePickerPackage;
import com.rnfs.RNFSPackage;
// import com.centaurwarchief.smslistener.SmsListenerPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.horcrux.svg.SvgPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.BV.LinearGradient.LinearGradientPackage;
import com.showlocationservicesdialogbox.LocationServicesDialogBoxPackage;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.razorpay.rn.RazorpayPackage;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new MainReactPackage(), new RNFirebasePackage(),
          new RNFirebaseMessagingPackage(), new RNFirebaseNotificationsPackage(), new VectorIconsPackage(),
          new RNShimmerPackage(), new ImageResizerPackage(), new ImagePickerPackage(), new RNFSPackage(),
         new MapsPackage(), new SvgPackage(), new LinearGradientPackage(),
          new LocationServicesDialogBoxPackage(), new RNFusedLocationPackage(), new RazorpayPackage());
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fresco.initialize(this);
    SoLoader.init(this, /* native exopackage */ false);
  }

}
