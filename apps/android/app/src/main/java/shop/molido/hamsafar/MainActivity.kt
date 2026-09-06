package shop.molido.hamsafar

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {
  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val view = WebView(this)
    setContentView(view)
    view.settings.javaScriptEnabled = true
    view.settings.domStorageEnabled = true
    view.settings.allowFileAccess = false
    view.webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(v: WebView?, req: WebResourceRequest?): Boolean {
        val next = req?.url?.toString()
        return if (HostLock.allowed(next)) false else true
      }
    }
    view.webChromeClient = object : WebChromeClient() {
      override fun onGeolocationPermissionsShowPrompt(
        origin: String?,
        callback: GeolocationPermissions.Callback?
      ) {
        if (origin != null && origin.contains(HostLock.HOST)) callback?.invoke(origin, true, false)
        else callback?.invoke(origin, false, false)
      }
    }
    val home = "https://molidoai.github.io/Hamsafar-Ai/more.html"
    val bump = "https://molidoai.github.io/Hamsafar-Ai/update.html"
    view.loadUrl(home)
    thread {
      val newer = try { UpdateGate.hasNewer() } catch (_: Exception) { false }
      if (newer) runOnUiThread { view.loadUrl(bump) }
    }
  }
}
