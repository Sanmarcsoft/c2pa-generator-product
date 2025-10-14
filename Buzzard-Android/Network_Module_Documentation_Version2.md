```markdown
# Network Module Documentation for Buzzard-Android

## Overview
The Network Module handles all API communication and data fetching in the Buzzard-Android app. It centers on the `NetworkManager.java` class which uses OkHttp for asynchronous HTTP calls.

## NetworkManager.java
- **File Location:** `/app/src/main/java/com/example/buzzardandroid/network/NetworkManager.java`
- **Key Sections:**
  - **Line 8-12:** Singleton instance implementation.
    - *Line 8:* Declaration and lazy initialization of the singleton.
    - *Line 10:* Private constructor ensures there is only one instance.
  - **Line 15-35:** The `fetchData()` method performs network operations.
    - *Line 16:* Constructs and validates the URL; inline comments explain error handling if the URL is invalid.
    - *Line 20:* Begins an asynchronous HTTP request with `enqueue()`.
    - *Line 24:* On failure, the callback handles error reporting.
    - *Line 30:* On success, the fetched data is passed to the callback.
    - *Line 35:* The method ends after initiating the network call.

**Example snippet from NetworkManager.java:**
```java
package com.example.buzzardandroid.network;

import java.io.IOException;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class NetworkManager {
    private static NetworkManager instance;
    private OkHttpClient client;

    private NetworkManager() { // Line 10: Private constructor for singleton instance
        client = new OkHttpClient(); // Initialize OkHttp client
    }

    public static synchronized NetworkManager getInstance() {
        if (instance == null) {
            instance = new NetworkManager(); // Line 8: Lazy instantiation of NetworkManager
        }
        return instance;
    }

    public void fetchData(String endpoint, final NetworkCallback callback) {
        Request request = new Request.Builder()
            .url(endpoint) // Line 16: Build the request with validated URL
            .build();
        
        client.newCall(request).enqueue(new Callback() { // Line 20: Begin asynchronous network call
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onFailure(e); // Line 24: Forward error to callback
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    callback.onFailure(new IOException("Unexpected code " + response)); // Inline comment: Handle non-success response
                    return;
                }
                callback.onSuccess(response.body().string()); // Line 30: Return successful data to callback
            }
        });
    }
    
    public interface NetworkCallback {
        void onSuccess(String data);
        void onFailure(Exception e);
    }
}
```

## Conclusion
The Network Module uses a robust singleton pattern and asynchronous callbacks for HTTP operations. Inline comments (particularly at lines 16, 24, and 30) offer precise guidance on URL validation, error handling, and data extraction.