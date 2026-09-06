package shop.molido.hamsafar

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class RemoteRelease(
  val versionCode: Int,
  val apk: String?,
  val apkSha256: String?,
  val certSha256: String?
)

object UpdateGate {
  const val MANIFEST = "https://molidoai.github.io/Hamsafar-Ai/update.json"
  const val LOCAL_CODE = 32

  fun fetch(): RemoteRelease? {
    val conn = URL(MANIFEST).openConnection() as HttpURLConnection
    conn.connectTimeout = 4000
    conn.readTimeout = 4000
    return try {
      val j = JSONObject(conn.inputStream.bufferedReader().readText())
      fun clean(s: String?) = s?.takeIf { it.isNotBlank() && it != "null" }
      RemoteRelease(
        versionCode = j.optInt("versionCode", 0),
        apk = clean(j.optString("apk")),
        apkSha256 = clean(j.optString("apkSha256")),
        certSha256 = clean(j.optString("certSha256"))
      )
    } catch (_: Exception) {
      null
    } finally {
      conn.disconnect()
    }
  }

  fun hasNewer(): Boolean {
    val remote = fetch() ?: return false
    return remote.versionCode > LOCAL_CODE && !remote.apk.isNullOrBlank()
  }
}
