#include <avr/interrupt.h>
#include <avr/io.h>
#include <avr/iotn2313.h>
#include <avr/pgmspace.h>
#include <avr/sleep.h>
#include <stdlib.h>
#include <util/atomic.h>
#include <util/delay.h>

#define F_CPU 8000000

#define enableInterrupts() sei()
#define disableInterrupts() cli()

#define SERIAL_BAUD_RATE 9600
#define SERIAL_BUFFER_SIZE 11

#define SERIAL_ESCAPE 27
#define SERIAL_PULSE 1
#define SERIAL_HEARTBEAT 2

char serial_buffer[SERIAL_BUFFER_SIZE];

void initSerial() {
  // Configure baud rate.
  UBRRH = (uint8_t)(F_CPU / (16UL * SERIAL_BAUD_RATE) - 1) >> 8;
  UBRRL = (uint8_t)(F_CPU / (16UL * SERIAL_BAUD_RATE) - 1);

  // Enable transmitter and receiver.
  UCSRB = (1 << RXEN) | (1 << TXEN);
}

void putChar(char value) {
  // Wait until UART becomes ready.
  loop_until_bit_is_set(UCSRA, UDRE);
  // Send one character.
  UDR = value;
}

void putUint8(uint8_t value) {
  if (value == SERIAL_ESCAPE) {
    putChar(SERIAL_ESCAPE);
  }
  putChar(value);
}

void putUint32(uint32_t value) {
  putUint8((value >> 24) & 255);
  putUint8((value >> 16) & 255);
  putUint8((value >> 8) & 255);
  putUint8(value & 255);
}

void putString(const char *buffer) {
  while (*buffer != '\0') {
    putChar(*buffer);
    ++buffer;
  }
}

void putProgramString(const char *buffer) {
  while (pgm_read_byte(buffer) != '\0') {
    putChar(pgm_read_byte(buffer++));
  }
}

// Milliseconds and microseconds using Timer0 adapted from:
// https://github.com/arduino/ArduinoCore-avr/blob/master/cores/arduino/wiring.c

#define CYCLES_PER_MICRO (F_CPU / 1000000L)
#define MICROS_PER_TIMER_OVERFLOW ((64 * 256) / CYCLES_PER_MICRO)
#define MILLIS_INC (MICROS_PER_TIMER_OVERFLOW / 1000)
#define FRACT_INC ((MICROS_PER_TIMER_OVERFLOW % 1000) >> 3)
#define FRACT_MAX (1000 >> 3)

volatile uint32_t timer0_millis = 0;
uint8_t timer0_fract = 0;
volatile uint32_t timer0_overflow_count = 0;

void initTimer0() {
  TCCR0A = 0;
  TCCR0B = _BV(CS01) | _BV(CS00); // Prescale to clock/64
  TIMSK |= _BV(TOIE0);            // Enable Timer0 overflow interrupt
}

ISR(TIMER0_OVF_vect) {
  uint32_t millis = timer0_millis;
  uint8_t fract = timer0_fract;

  millis += MILLIS_INC;
  fract += FRACT_INC;
  if (fract >= FRACT_MAX) {
    ++millis;
    fract -= FRACT_MAX;
  }

  timer0_millis = millis;
  timer0_fract = fract;
  ++timer0_overflow_count;
}

uint32_t getMillis() {
  uint32_t millis;
  ATOMIC_BLOCK(ATOMIC_RESTORESTATE) { millis = timer0_millis; }
  return millis;
}

uint32_t getPrescaledClock() {
  uint32_t overflow;
  uint8_t counter;
  uint8_t flags;
  ATOMIC_BLOCK(ATOMIC_RESTORESTATE) {
    overflow = timer0_overflow_count;
    counter = TCNT0;
    flags = TIFR;
  }
  if ((flags & _BV(TOV0)) && counter < 255) {
    ++overflow;
  }
  return (overflow << 8) + counter;
}

uint32_t getMicros() { return getPrescaledClock() * (64 / CYCLES_PER_MICRO); }

volatile uint32_t timer1_seconds;

void initTimer1() {
  TCCR1A = 0;
  TCCR1B = _BV(WGM12) |     // Clear timer on compare (CTC)
           _BV(CS12);       // Prescale to clock/256
  OCR1 = (F_CPU / 256) - 1; // Overflow after 1s
  TIMSK |= _BV(OCIE1A);     // Enable Timer1 interrupt
}

ISR(TIMER1_COMPA_vect) { ++timer1_seconds; }

volatile uint32_t pulse_time;

ISR(INT0_vect) {
  if (pulse_time == 0) {
    pulse_time = getPrescaledClock();
  }
}

void startPulse() { PORTB |= _BV(PB4); }

void stopPulse() { PORTB &= ~(_BV(PB4)); }

void checkPulse() {
  uint32_t time;
  ATOMIC_BLOCK(ATOMIC_RESTORESTATE) {
    time = pulse_time;
    pulse_time = 0;
  }

  if (time > 0) {
    // startPulse();

    putChar(SERIAL_ESCAPE);
    putChar(SERIAL_PULSE);
    putUint32(time);

    // _delay_ms(10);
    // stopPulse();
  }
}

int main(void) {
  initSerial();
  initTimer0();
  initTimer1();

  // Configure ports.
  DDRB |= _BV(PB4); // LED output

  // Configure external interrupts.
  MCUCR |= _BV(ISC01); // Interrupts on the falling edge of INT0
  GIMSK |= _BV(INT0);  // Enable external interrupts on INT0 pin

  startPulse();
  _delay_ms(1000);
  stopPulse();

  enableInterrupts();

  uint32_t prev_seconds = 0;
  uint32_t next_seconds;
  while (1) {
    ATOMIC_BLOCK(ATOMIC_RESTORESTATE) { next_seconds = timer1_seconds; }
    if (prev_seconds != next_seconds) {
      prev_seconds = next_seconds;
      putChar(SERIAL_ESCAPE);
      putChar(SERIAL_HEARTBEAT);
      putUint32(getPrescaledClock());
    }
    checkPulse();
  }

  return 0;
}
