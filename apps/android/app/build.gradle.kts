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
    versionCode = 31
    versionName = "0.3.1"
  }
  buildTypes {
    release {
      isMinifyEnabled = false
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
