package shop.molido.hamsafar

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val view = WebView(this)
    setContentView(view)
    view.settings.javaScriptEnabled = true
    view.settings.domStorageEnabled = true
    view.webViewClient = WebViewClient()
    view.webChromeClient = object : WebChromeClient() {
      override fun onGeolocationPermissionsShowPrompt(
        origin: String?,
        callback: GeolocationPermissions.Callback?
      ) {
        callback?.invoke(origin, true, false)
      }
    }
    view.loadUrl("https://molidoai.github.io/Hamsafar-Ai/more.html")
  }
}
