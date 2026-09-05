package shop.molido.hamsafar

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object UpdateGate {
  const val MANIFEST = "https://molidoai.github.io/Hamsafar-Ai/update.json"
  const val LOCAL_CODE = 31

  fun remoteCode(): Int {
    val conn = URL(MANIFEST).openConnection() as HttpURLConnection
    conn.connectTimeout = 4000
    conn.readTimeout = 4000
    return try {
      val body = conn.inputStream.bufferedReader().readText()
      JSONObject(body).optInt("versionCode", LOCAL_CODE)
    } catch (_: Exception) {
      LOCAL_CODE
    } finally {
      conn.disconnect()
    }
  }

  fun hasNewer(): Boolean = remoteCode() > LOCAL_CODE
}
