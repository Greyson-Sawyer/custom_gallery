# 📑 Database Schema Documentation

## 🗂️ Tables and Relationships

### 1. Images

| Column Name    | Data Type | Constraints                       |
| -------------- | --------- | --------------------------------- |
| `id`           | INTEGER   | PRIMARY KEY, AUTOINCREMENT        |
| `file_path`    | TEXT      | UNIQUE, NOT NULL                  |
| `filename`     | TEXT      | NOT NULL                          |
| `processed_at` | TEXT      | NOT NULL (ISO-formatted datetime) |

**Relationships:**

-   One-to-Many with `Luminance`, `Saturation`, `GLCM`, `Laplacian`, `KMeansClustering`

### 2. Luminance

| Column Name          | Data Type | Constraints                                           |
| -------------------- | --------- | ----------------------------------------------------- |
| `image_id`           | INTEGER   | FOREIGN KEY REFERENCES `Images(id)` ON DELETE CASCADE |
| `mean_luminance`     | REAL      | NOT NULL                                              |
| `median_luminance`   | REAL      | NOT NULL                                              |
| `std_luminance`      | REAL      | NOT NULL                                              |
| `dynamic_range`      | REAL      | NOT NULL                                              |
| `rms_contrast`       | REAL      | NOT NULL                                              |
| `michelson_contrast` | REAL      | NOT NULL                                              |
| `luminance_skewness` | REAL      | NOT NULL                                              |
| `luminance_kurtosis` | REAL      | NOT NULL                                              |

### 3. Saturation

| Column Name         | Data Type | Constraints                                           |
| ------------------- | --------- | ----------------------------------------------------- |
| `image_id`          | INTEGER   | FOREIGN KEY REFERENCES `Images(id)` ON DELETE CASCADE |
| `mean_saturation`   | REAL      | NOT NULL                                              |
| `median_saturation` | REAL      | NOT NULL                                              |
| `std_saturation`    | REAL      | NOT NULL                                              |

### 4. GLCM

| Column Name   | Data Type | Constraints                                           |
| ------------- | --------- | ----------------------------------------------------- |
| `image_id`    | INTEGER   | FOREIGN KEY REFERENCES `Images(id)` ON DELETE CASCADE |
| `contrast`    | REAL      | NOT NULL                                              |
| `correlation` | REAL      | NOT NULL                                              |

### 5. Laplacian

| Column Name | Data Type | Constraints                                           |
| ----------- | --------- | ----------------------------------------------------- |
| `image_id`  | INTEGER   | FOREIGN KEY REFERENCES `Images(id)` ON DELETE CASCADE |
| `variance`  | REAL      | NOT NULL                                              |

### 6. KMeansClustering

| Column Name    | Data Type | Constraints                                           |
| -------------- | --------- | ----------------------------------------------------- |
| `id`           | INTEGER   | PRIMARY KEY, AUTOINCREMENT                            |
| `image_id`     | INTEGER   | FOREIGN KEY REFERENCES `Images(id)` ON DELETE CASCADE |
| `num_clusters` | INTEGER   | NOT NULL                                              |

**Relationships:**

-   One-to-Many with `Clusters`

### 7. Clusters

| Column Name     | Data Type | Constraints                                                     |
| --------------- | --------- | --------------------------------------------------------------- |
| `clustering_id` | INTEGER   | FOREIGN KEY REFERENCES `KMeansClustering(id)` ON DELETE CASCADE |
| `cluster_index` | INTEGER   | NOT NULL                                                        |
| `r`             | INTEGER   | NOT NULL                                                        |
| `g`             | INTEGER   | NOT NULL                                                        |
| `b`             | INTEGER   | NOT NULL                                                        |
| `count`         | INTEGER   | NOT NULL                                                        |
| `percentage`    | REAL      | NOT NULL                                                        |

---

## 🖥️ Additional Tips for Prisma and Next.js Integration

-   **Prisma Studio:** Visualize and interact with your database using Prisma Studio.

    ```bash
    npx prisma studio
    ```
