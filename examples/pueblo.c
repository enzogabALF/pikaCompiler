/* ⚡ PIKA COMPILER GENERATED C CODE ⚡ */
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

/* --- Mochila Structs and Helpers --- */
typedef struct {
    int* data;
    int size;
    int capacity;
} Mochila_int;

typedef struct {
    float* data;
    int size;
    int capacity;
} Mochila_float;

typedef struct {
    const char** data;
    int size;
    int capacity;
} Mochila_string;

typedef struct {
    bool* data;
    int size;
    int capacity;
} Mochila_bool;

static inline void mochila_int_push(Mochila_int* m, int val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(int));
    }
    m->data[m->size++] = val;
}
static inline int mochila_int_pop(Mochila_int* m) {
    if (m->size == 0) return 0;
    return m->data[--m->size];
}

static inline void mochila_float_push(Mochila_float* m, float val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(float));
    }
    m->data[m->size++] = val;
}
static inline float mochila_float_pop(Mochila_float* m) {
    if (m->size == 0) return 0.0f;
    return m->data[--m->size];
}

static inline void mochila_string_push(Mochila_string* m, const char* val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(const char*));
    }
    m->data[m->size++] = val;
}
static inline const char* mochila_string_pop(Mochila_string* m) {
    if (m->size == 0) return "";
    return m->data[--m->size];
}

static inline void mochila_bool_push(Mochila_bool* m, bool val) {
    if (m->size >= m->capacity) {
        m->capacity = m->capacity == 0 ? 4 : m->capacity * 2;
        m->data = realloc(m->data, m->capacity * sizeof(bool));
    }
    m->data[m->size++] = val;
}
static inline bool mochila_bool_pop(Mochila_bool* m) {
    if (m->size == 0) return false;
    return m->data[--m->size];
}

/* Generic GUARDAR/Push macro */
#define GUARDAR(m, val) _Generic(&(m),     Mochila_int*: mochila_int_push,     Mochila_float*: mochila_float_push,     Mochila_string*: mochila_string_push,     Mochila_bool*: mochila_bool_push )(&(m), val)

/* Generic SACAR/Pop macro */
#define SACAR(m) _Generic(&(m),     Mochila_int*: mochila_int_pop,     Mochila_float*: mochila_float_pop,     Mochila_string*: mochila_string_pop,     Mochila_bool*: mochila_bool_pop )(&(m))

/* --- Builtin I/O Helpers --- */
static inline void print_int(int x) { printf("%d\n", x); }
static inline void print_float(float x) { printf("%f\n", x); }
static inline void print_string(const char* x) { printf("%s\n", x); }
static inline void print_bool(bool x) { printf("%s\n", x ? "true" : "false"); }
static inline void print_ptr(void* x) { printf("%p\n", x); }

#define DICE_PROF_OAK(X) _Generic((X),     int: print_int,     float: print_float,     const char*: print_string,     char*: print_string,     bool: print_bool,     default: print_ptr )(X)

static inline int OAK_PREGUNTA(const char* prompt) {
    printf("%s ", prompt);
    int val;
    if (scanf("%d", &val) != 1) val = 0;
    return val;
}

/* --- Compiled Functions --- */
int main(void) {
    DICE_PROF_OAK("--- INICIANDO AVENTURA ---");
    int mi_nivel = 0;
    mi_nivel = OAK_PREGUNTA("¿Qué nivel tiene tu Pokémon inicial?");
    int mis_niveles[3] = {0};
    mis_niveles[0] = mi_nivel;
    mis_niveles[1] = (mi_nivel + 5);
    mis_niveles[2] = (mi_nivel + 10);
    DICE_PROF_OAK("El nivel del segundo Pokémon es:");
    DICE_PROF_OAK(mis_niveles[1]);
    int ps_combate = 100;
    int* radar_centro_medico = NULL;
    radar_centro_medico = (&(ps_combate));
    if ((ps_combate < 50)) {
      DICE_PROF_OAK("¡Alerta! PS bajos. Usando radar médico para curar...");
      (*(radar_centro_medico)) = 100;
    }
    DICE_PROF_OAK("PS actuales del Pokémon:");
    DICE_PROF_OAK(ps_combate);
    return 0;
}
