package shop.molido.hamsafar

import android.net.Uri

object HostLock {
  const val HOST = "molidoai.github.io"
  const val PREFIX = "/Hamsafar-Ai/"
  fun allowed(url: String?): Boolean {
    if (url.isNullOrBlank()) return false
    val u = Uri.parse(url)
    return u.scheme == "https" && u.host == HOST && (u.path ?: "").startsWith(PREFIX)
  }
}
