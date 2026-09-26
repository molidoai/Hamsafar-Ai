plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
}
android {
  namespace = "shop.molido.hamsafar"
  compileSdk = 35
  defaultConfig {
    applicationId = "shop.molido.hamsafar"
    minSdk = 24
    targetSdk = 35
    versionCode = 32
    versionName = "0.3.2"
  }
  signingConfigs {
    create("release") {
      val path = System.getenv("KEYSTORE_PATH")
      if (!path.isNullOrBlank()) {
        storeFile = file(path)
        storePassword = System.getenv("KEYSTORE_PASSWORD") ?: ""
        keyAlias = System.getenv("KEY_ALIAS") ?: ""
        keyPassword = System.getenv("KEY_PASSWORD") ?: ""
      }
    }
  }
  buildTypes {
    release {
      isMinifyEnabled = false
      signingConfig = signingConfigs.getByName("release")
    }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
  kotlinOptions { jvmTarget = "17" }
}
dependencies {
  implementation("androidx.appcompat:appcompat:1.7.0")
  implementation("androidx.webkit:webkit:1.12.1")
}
